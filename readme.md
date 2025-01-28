# Chat Anonim

A safe space for anonymous conversations. Express yourself freely while maintaining your privacy and connecting with others.

## 🌟 Features

- 🔒 Anonymous messaging
- 🌓 Dark/Light mode
- 🏷️ Message tagging system
- 👍 Reactions and likes
- 💬 Threaded replies
- 🔍 Real-time search
- 🚀 Real-time updates
- 📱 Responsive design

## 🛠️ Tech Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: TailwindCSS with custom brutal design system
- **Backend**: Supabase
- **Real-time**: Supabase Realtime
- **Icons**: Lucide React
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chat-anonim.git
cd chat-anonim
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## 🗄️ Database Schema

### Messages Table
```sql
create table messages (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  username text not null,
  timestamp timestamptz default now(),
  tags text[] default '{}',
  likes integer default 0,
  replies integer default 0,
  parent_id uuid references messages(id),
  reactions jsonb default '[]'
);
```

### Message Likes Table
```sql
create table message_likes (
  id uuid default uuid_generate_v4() primary key,
  message_id uuid references messages(id),
  user_id text not null,
  created_at timestamptz default now(),
  unique(message_id, user_id)
);
```

## 🎨 Design System

The project uses a custom "brutal" design system with TailwindCSS:

- Shadow utilities: `.shadow-brutal`, `.shadow-brutal-white`
- Component classes: `.brutal-button`, `.brutal-input`, `.brutal-card`
- Dark mode support with `.dark` variant
- Custom color scheme with primary color `#ff5757`

## 🔒 Security

- Anonymous user IDs are generated and stored locally
- No personal information is collected
- Messages are stored in Supabase with RLS policies
- Client-side input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.io/) for the backend infrastructure
- [TailwindCSS](https://tailwindcss.com/) for the styling system
- [Lucide](https://lucide.dev/) for the beautiful icons
- [React](https://reactjs.org/) for the frontend framework

## Environment Setup

1. Copy `.env.example` to `.env.local`

