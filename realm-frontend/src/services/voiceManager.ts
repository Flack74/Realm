interface VoiceParticipant {
  userId: string;
  username: string;
  avatar?: string;
  isMuted: boolean;
  isDeafened: boolean;
  isConnected: boolean;
  volume: number;
  isSpeaking: boolean;
}

interface VoiceConnection {
  channelId: string;
  participants: Map<string, VoiceParticipant>;
  localStream?: MediaStream;
  peerConnections: Map<string, RTCPeerConnection>;
}

class VoiceManager {
  private connections = new Map<string, VoiceConnection>();
  private audioContext?: AudioContext;
  private localStream?: MediaStream;
  private isMuted = false;
  private isDeafened = false;
  private onParticipantUpdate?: (channelId: string, participants: VoiceParticipant[]) => void;

  async joinVoiceChannel(channelId: string): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });

      const connection: VoiceConnection = {
        channelId,
        participants: new Map(),
        localStream: this.localStream,
        peerConnections: new Map()
      };

      this.connections.set(channelId, connection);

      if (!this.audioContext) {
        this.audioContext = new AudioContext({ sampleRate: 48000 });
      }

      this.setupAudioProcessing(channelId);
      this.notifyVoiceJoin(channelId);
    } catch (error) {
      console.error('Failed to join voice channel:', error);
      throw error;
    }
  }

  async leaveVoiceChannel(channelId: string): Promise<void> {
    const connection = this.connections.get(channelId);
    if (!connection) return;

    connection.peerConnections.forEach(pc => pc.close());
    connection.localStream?.getTracks().forEach(track => track.stop());
    this.connections.delete(channelId);
    this.notifyVoiceLeave(channelId);
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.connections.forEach(connection => {
      connection.localStream?.getAudioTracks().forEach(track => {
        track.enabled = !this.isMuted;
      });
    });
    return this.isMuted;
  }

  toggleDeafen(): boolean {
    this.isDeafened = !this.isDeafened;
    if (this.isDeafened) {
      this.isMuted = true;
    }
    
    this.connections.forEach(connection => {
      connection.localStream?.getAudioTracks().forEach(track => {
        track.enabled = !this.isMuted;
      });
    });
    return this.isDeafened;
  }

  setVolume(userId: string, volume: number): void {
    this.connections.forEach(connection => {
      const participant = connection.participants.get(userId);
      if (participant) {
        participant.volume = volume;
      }
    });
  }

  private setupAudioProcessing(channelId: string): void {
    const connection = this.connections.get(channelId);
    if (!connection?.localStream || !this.audioContext) return;

    const source = this.audioContext.createMediaStreamSource(connection.localStream);
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const detectSpeaking = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      // Update local speaking status
      this.updateLocalSpeaking(channelId, average > 15);
      requestAnimationFrame(detectSpeaking);
    };
    
    detectSpeaking();
  }

  private updateLocalSpeaking(channelId: string, isSpeaking: boolean): void {
    // Notify other participants of speaking status
    this.notifyVoiceUpdate(channelId, { isSpeaking });
  }

  private async createPeerConnection(userId: string, channelId: string): Promise<RTCPeerConnection> {
    const connection = this.connections.get(channelId);
    if (!connection) throw new Error('Voice connection not found');

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    if (connection.localStream) {
      connection.localStream.getTracks().forEach(track => {
        pc.addTrack(track, connection.localStream!);
      });
    }

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      this.handleRemoteStream(userId, remoteStream, channelId);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendIceCandidate(userId, event.candidate);
      }
    };

    connection.peerConnections.set(userId, pc);
    return pc;
  }

  private handleRemoteStream(userId: string, stream: MediaStream, channelId: string): void {
    const audio = new Audio();
    audio.srcObject = stream;
    audio.play();

    this.detectRemoteSpeaking(userId, stream, channelId);
  }

  private detectRemoteSpeaking(userId: string, stream: MediaStream, channelId: string): void {
    if (!this.audioContext) return;

    const analyser = this.audioContext.createAnalyser();
    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const checkSpeaking = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      this.updateParticipantSpeaking(userId, channelId, average > 10);
      requestAnimationFrame(checkSpeaking);
    };
    
    checkSpeaking();
  }

  private updateParticipantSpeaking(userId: string, channelId: string, isSpeaking: boolean): void {
    const connection = this.connections.get(channelId);
    if (!connection) return;

    const participant = connection.participants.get(userId);
    if (participant) {
      participant.isSpeaking = isSpeaking;
      this.notifyParticipantUpdate(channelId);
    }
  }

  private notifyParticipantUpdate(channelId: string): void {
    const connection = this.connections.get(channelId);
    if (connection && this.onParticipantUpdate) {
      const participants = Array.from(connection.participants.values());
      this.onParticipantUpdate(channelId, participants);
    }
  }

  private notifyVoiceJoin(channelId: string): void {
    console.log(`Joining voice channel: ${channelId}`);
  }

  private notifyVoiceLeave(channelId: string): void {
    console.log(`Leaving voice channel: ${channelId}`);
  }

  private notifyVoiceUpdate(channelId: string, data: any): void {
    console.log(`Voice update for ${channelId}:`, data);
  }

  private sendIceCandidate(userId: string, candidate: RTCIceCandidate): void {
    console.log(`Sending ICE candidate to ${userId}:`, candidate);
  }

  // Public getters
  get muted(): boolean { return this.isMuted; }
  get deafened(): boolean { return this.isDeafened; }
  
  getConnection(channelId: string): VoiceConnection | undefined {
    return this.connections.get(channelId);
  }

  setParticipantUpdateCallback(callback: (channelId: string, participants: VoiceParticipant[]) => void): void {
    this.onParticipantUpdate = callback;
  }
}

export const voiceManager = new VoiceManager();
export type { VoiceParticipant, VoiceConnection };