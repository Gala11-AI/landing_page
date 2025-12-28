import React, { useState, useEffect } from 'react'
import { ChevronDown, ShieldCheck, BookOpen, BarChart3, Check } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// --- Utility for merging tailwind classes ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- Supabase Client ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only initialize if keys are present to avoid errors during build/dev if not set
const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null

// --- Flattened UI Components (Replacing @acme/ui) ---
const Button = ({ className, variant = "default", size = "default", ...props }: any) => {
  const variants: any = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black",
    ghost: "text-gray-400 hover:text-cyan-400",
  }
  const sizes: any = {
    default: "h-10 px-4 py-2",
    lg: "h-12 px-8 text-lg",
  }
  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none", 
        variants[variant], 
        sizes[size], 
        className
      )} 
      {...props} 
    />
  )
}

const Input = ({ className, ...props }: any) => (
  <input 
    className={cn(
      "flex h-10 w-full rounded-md border border-gray-700 bg-gray-900/80 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors", 
      className
    )} 
    {...props} 
  />
)

// --- Internal Components ---
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-medium text-white group-hover:text-cyan-400 transition-colors">
          {question}
        </span>
        <span className={cn("ml-6 flex-shrink-0 transition-transform duration-300", isOpen && "rotate-180")}>
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </span>
      </button>
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <p className="text-gray-400 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  )
}

function WaitlistForm() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    role: ''
  })
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!supabase) {
        // Fallback for when backend is not connected yet
        console.warn("Supabase keys not found. Simulating success...")
        await new Promise(resolve => setTimeout(resolve, 800))
        if (step === 1) setStep(2)
        else setStep(3)
        return
      }

      if (step === 1) {
        // Step 1: Just insert/upsert the email
        const { error } = await supabase
          .from('waitlist')
          .upsert({ email: formData.email }, { onConflict: 'email' })
        
        if (error) throw error
        setStep(2)
      } else if (step === 2) {
        // Step 2: Update with additional info
        const { error } = await supabase
          .from('waitlist')
          .update({ 
            name: formData.name, 
            company: formData.company, 
            role: formData.role 
          })
          .eq('email', formData.email)
        
        if (error) throw error
        setStep(3)
      }
    } catch (error: any) {
      console.error("Waitlist error:", error.message)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 3) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-md border electric-border rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-6 h-6 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">You're on the list!</h3>
        <p className="text-gray-300">We'll reach out to <strong>{formData.email}</strong> as soon as early access spots open up.</p>
        <Button 
          variant="ghost" 
          onClick={() => {
            setFormData({ email: '', name: '', company: '', role: '' })
            setStep(1)
          }}
          className="mt-4 text-cyan-400"
        >
          Add another email
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      {step === 1 ? (
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="Enter your work email"
            required
            value={formData.email}
            onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
            className="h-12 text-lg"
          />
          <Button 
            type="submit" 
            className="electric-button electric-glow h-12 px-8 text-lg font-semibold whitespace-nowrap"
            disabled={isLoading}
          >
            {isLoading ? "Joining..." : "Join Waitlist"}
          </Button>
        </div>
      ) : (
        <div className="bg-gray-900/80 border border-white/10 rounded-xl p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-300 text-left">
          <h3 className="text-white font-semibold text-lg mb-2">Help us prioritize your access</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
              <Input
                placeholder="Jane Doe"
                value={formData.name}
                onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Company</label>
                <Input
                  placeholder="Acme Inc"
                  value={formData.company}
                  onChange={(e: any) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Role</label>
                <Input
                  placeholder="Data Analyst"
                  value={formData.role}
                  onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="pt-2">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full electric-button electric-glow h-12 text-lg font-semibold"
            >
              {isLoading ? 'Saving...' : 'Get Priority Access'}
            </Button>
            <button 
              type="button" 
              onClick={() => setStep(3)}
              className="w-full text-gray-500 text-sm hover:text-white transition-colors pt-3"
            >
              I'll provide this later
            </button>
          </div>
        </div>
      )}
    </form>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-black selection:bg-cyan-500/30">
      {/* Navigation */}
      <nav className="bg-black border-b border-white/10 fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 sm:h-10 w-auto">
                <img src="./logo.png" alt="Gala11" className="logo-cropped h-full" />
              </div>
              <span className="ml-3 text-xl sm:text-2xl font-bold text-white tracking-tight">Gala11</span>
            </div>
            <div className="flex items-center space-x-6">
              <Button 
                onClick={() => document.getElementById('bottom-waitlist')?.scrollIntoView({ behavior: 'smooth' })}
                className="electric-button electric-glow text-white text-sm"
              >
                Join Waitlist
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-32 isolate">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-cyan-400 ring-1 ring-cyan-400/20 bg-cyan-400/10 mb-8">
              Now accepting early access requests
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-8 tracking-tight leading-[1.1]">
              <span className="block text-white">Data Products that</span>
              <span className="electric-text block mt-2">Manage Themselves</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              The first AI-agentic platform for Data Product Management. While you build, our autonomous agent proactively monitors quality, updates documentation, and keeps your stakeholders in sync.
            </p>
            
            <div id="waitlist-form-container">
              <WaitlistForm />
              <p className="text-sm text-gray-500 mt-4">Join 500+ data leaders from top tech companies.</p>
            </div>

            <div className="mt-16 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <img src="./demo-preview.webp" alt="Gala11 Preview" className="w-full h-auto opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02] isolate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">
            Easily integrate with your existing tools
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale contrast-125">
             <span className="text-2xl font-bold text-white">DATABRICKS</span>
             <span className="text-2xl font-bold text-white">SNOWFLAKE</span>
             <span className="text-2xl font-bold text-white">BIGQUERY</span>
             <span className="text-2xl font-bold text-white">SLACK</span>
             <span className="text-2xl font-bold text-white">JIRA</span>
             <span className="text-2xl font-bold text-white">TEAMS</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-black isolate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                AI Agent on the background, <span className="electric-text">Product quality at the forefront.</span>
              </h2>
              <p className="text-lg text-gray-400 mb-10 leading-relaxed">
                Gala11 is your autonomous team member ensuring data products stay high-quality, documented, and reliable.
              </p>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <ShieldCheck className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Autonomous Governance</h3>
                    <p className="text-gray-400">Schema monitoring with automatic alerts via Slack or Email.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Living Documentation</h3>
                    <p className="text-gray-400">AI keeps documentation synced with evolving models.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <BarChart3 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Product-Centric Observability</h3>
                    <p className="text-gray-400">Monitor health, schema history, and quality metrics in one place.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 aspect-video flex flex-col justify-center">
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Agent Active</span>
               </div>
               <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-3/4 animate-pulse"></div>
               </div>
               <p className="text-sm text-gray-500 mt-4">Monitoring Snowflake production...</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-black relative overflow-hidden isolate">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Common <span className="electric-text">Questions</span>
            </h2>
          </div>
          <div className="space-y-2">
            <FaqItem 
              question="What is an AI-agentic Data Product?" 
              answer="It's a data asset with an autonomous 'brain' that proactively monitors its own health, updates documentation, and alerts you when something breaks." 
            />
            <FaqItem 
              question="How does the agent communicate?" 
              answer="The agent integrates directly with Slack, Email, and Jira. When it detects an issue, it reaches out to the person responsible autonomously." 
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="bottom-waitlist" className="bg-black text-white py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2025 Gala11. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

