import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  return (
    <div className="app-container">
      <Header />
      <main>
        <Dashboard />
      </main>
    </div>
  );
}
