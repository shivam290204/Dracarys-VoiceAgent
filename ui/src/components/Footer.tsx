export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-4 px-6">
      <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
        <span>&copy; {year} Dracarys</span>
        <span className="text-border">|</span>
        <a
          href="/settings"
          className="hover:text-foreground transition-colors"
        >
          Settings
        </a>
        <span className="text-border">|</span>
        <a
          href="https://github.com/dograh-hq/dograh"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
