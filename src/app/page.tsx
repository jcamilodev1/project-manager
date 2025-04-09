import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-background/90">
      <header className="py-4 px-6 flex justify-between items-center shadow-sm">
        <div className="text-2xl font-bold hover:text-primary transition-colors">Grayola</div>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="px-5 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
          >
            Login
          </Link>
          <ModeToggle />
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
          Welcome to <span className="text-primary">Grayola</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10">
          A modern web application with authentication and a clean, responsive UI using ShadCN UI and Tailwind CSS.
        </p>
        <div className="flex gap-4">
          <Link 
            href="/login" 
            className="px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
          >
            Get Started
          </Link>
          <Link 
            href="https://ui.shadcn.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
          >
            Learn More
          </Link>
        </div>
      </main>
      
      <footer className="py-4 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Grayola. All rights reserved.
      </footer>
    </div>
  )
}
