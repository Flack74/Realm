-- Enhanced database schema for Discord-like functionality

-- User profile enhancements
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(32) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(32);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'offline';
ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_status TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS activity_type VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS activity_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP;

-- Channel categories
CREATE TABLE IF NOT EXISTS channel_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    realm_id UUID REFERENCES realms(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced channels
ALTER TABLE channels ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES channel_categories(id);
ALTER TABLE channels ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'text';
ALTER TABLE channels ADD COLUMN IF NOT EXISTS topic TEXT;
ALTER TABLE channels ADD COLUMN IF NOT EXISTS nsfw BOOLEAN DEFAULT FALSE;
ALTER TABLE channels ADD COLUMN IF NOT EXISTS slow_mode INTEGER DEFAULT 0;
ALTER TABLE channels ADD COLUMN IF NOT EXISTS user_limit INTEGER DEFAULT 0;
ALTER TABLE channels ADD COLUMN IF NOT EXISTS bitrate INTEGER DEFAULT 64000;

-- Message enhancements
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES messages(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'default';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachments JSONB;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS embeds JSONB;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS mentions JSONB;

-- Message reactions
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    emoji_name VARCHAR(50) NOT NULL,
    emoji_id UUID NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji_name)
);

-- Friend system
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(requester_id, receiver_id)
);

-- Direct messages
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) DEFAULT 'dm',
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

-- Voice states
CREATE TABLE IF NOT EXISTS voice_states (
    user_id UUID REFERENCES users(id) PRIMARY KEY,
    channel_id UUID REFERENCES channels(id),
    realm_id UUID REFERENCES realms(id),
    self_muted BOOLEAN DEFAULT FALSE,
    self_deafened BOOLEAN DEFAULT FALSE,
    server_muted BOOLEAN DEFAULT FALSE,
    server_deafened BOOLEAN DEFAULT FALSE,
    connected_at TIMESTAMP DEFAULT NOW()
);

-- Permissions system
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Insert Discord-like permissions
INSERT INTO permissions (name, description) VALUES
('ADMINISTRATOR', 'Administrator - all permissions'),
('MANAGE_REALM', 'Manage server settings'),
('MANAGE_ROLES', 'Manage roles and permissions'),
('MANAGE_CHANNELS', 'Create, edit, delete channels'),
('KICK_MEMBERS', 'Kick members from server'),
('BAN_MEMBERS', 'Ban members from server'),
('CREATE_INSTANT_INVITE', 'Create invite links'),
('CHANGE_NICKNAME', 'Change own nickname'),
('MANAGE_NICKNAMES', 'Manage others nicknames'),
('SEND_MESSAGES', 'Send messages in text channels'),
('MANAGE_MESSAGES', 'Delete others messages'),
('EMBED_LINKS', 'Links embedded automatically'),
('ATTACH_FILES', 'Upload files and media'),
('READ_MESSAGE_HISTORY', 'Read message history'),
('MENTION_EVERYONE', 'Mention @everyone and @here'),
('USE_EXTERNAL_EMOJIS', 'Use emojis from other servers'),
('CONNECT', 'Connect to voice channels'),
('SPEAK', 'Speak in voice channels'),
('MUTE_MEMBERS', 'Mute members in voice channels'),
('DEAFEN_MEMBERS', 'Deafen members in voice channels'),
('MOVE_MEMBERS', 'Move members between voice channels')
ON CONFLICT (name) DO NOTHING;

-- Role permissions junction
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_channel_created ON messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(requester_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_voice_states_channel ON voice_states(channel_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);