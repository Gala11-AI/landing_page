import React, { useState, useEffect } from 'react'
import { ChevronDown, ShieldCheck, BookOpen, BarChart3, Check, Zap, Info, Shield, MessageSquare, Mail } from 'lucide-react'
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
  const [step, setStep] = useState(1) // 1: Email, 2: Details, 3: Success
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
      // Even if there's an error (e.g. 409 already on list), we might want to let them proceed
      if (step === 1) setStep(2)
      else setStep(3)
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
          className="mt-4 text-cyan-400 hover:text-cyan-300"
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
            className="bg-gray-900/80 border-gray-700 text-white h-12 text-lg focus:border-cyan-400"
          />
          <Button 
            type="submit" 
            className="electric-button electric-glow text-white h-12 px-8 text-lg font-semibold whitespace-nowrap"
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
                className="bg-black/50 border-gray-700 text-white h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Company</label>
                <Input
                  placeholder="Acme Inc"
                  value={formData.company}
                  onChange={(e: any) => setFormData({ ...formData, company: e.target.value })}
                  className="bg-black/50 border-gray-700 text-white h-10"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Role</label>
                <Input
                  placeholder="Data Analyst"
                  value={formData.role}
                  onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}
                  className="bg-black/50 border-gray-700 text-white h-10"
                />
              </div>
            </div>
          </div>
          <div className="pt-2">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full electric-button electric-glow text-white h-12 text-lg font-semibold"
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
    <div className="min-h-screen bg-black selection:bg-cyan-500/30" style={{ scrollBehavior: 'smooth' }}>
      <style>{`
        html {
          scroll-behavior: smooth;
          overflow-y: scroll;
        }
        body {
          overflow-x: hidden;
        }
        nav {
          -webkit-transform: translate3d(0, 0, 0);
          transform: translate3d(0, 0, 0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          will-change: auto;
        }
      `}</style>
      {/* Navigation */}
      <nav className="bg-black border-b border-white/10 fixed top-0 left-0 right-0 z-40" style={{ contain: 'layout paint', backfaceVisibility: 'hidden', WebkitFontSmoothing: 'antialiased', transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 sm:h-10 w-auto">
                <img 
                  src="./logo.png" 
                  alt="Gala11" 
                  className="logo-cropped h-full"
                />
              </div>
              <span className="ml-3 text-xl sm:text-2xl font-bold text-white tracking-tight">Gala11</span>
            </div>
            <div className="flex items-center space-x-6">
              {/* Sign In option removed as per request */}
              <Button 
                onClick={() => {
                  const el = document.getElementById('bottom-waitlist')
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
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
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium leading-5 text-cyan-400 ring-1 ring-inset ring-cyan-400/20 bg-cyan-400/10 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
              Now accepting early access requests
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-8 tracking-tight leading-[1.1]">
              <span className="block text-white">Data Products that</span>
              <span className="electric-text block mt-2">
                Manage Themselves
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              The first AI-agentic platform for Data Product Management. While you build, our autonomous agent proactively monitors quality, updates documentation, and keeps your stakeholders in sync.
            </p>
            
            <div id="waitlist-form-container" className="mb-8 scroll-mt-20">
              <WaitlistForm />
              <p className="text-sm text-gray-500 mt-4">
                Join 500+ data leaders from top tech companies.
              </p>
            </div>

            <div className="mt-16 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-[16/9] bg-gray-800 flex items-center justify-center overflow-hidden">
                  <img 
                    src="./demo-preview.webp" 
                    alt="Gala11 AI Agent Platform" 
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                </div>
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                {/* Autonomous Governance Mock */}
                <div className="aspect-square rounded-2xl bg-gray-900 border border-white/10 p-6 flex flex-col overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent"></div>
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Agent Monitoring</span>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded bg-cyan-500/20 flex items-center justify-center">
                          <Zap className="w-3 h-3 text-cyan-400" />
                        </div>
                        <div className="h-1.5 w-16 bg-gray-700 rounded"></div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-1 w-full bg-gray-800 rounded"></div>
                        <div className="h-1 w-3/4 bg-gray-800 rounded"></div>
                      </div>
                    </div>
                    <div className="mt-auto bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <p className="text-[10px] text-cyan-300 font-medium mb-1">Schema Drift Detected</p>
                      <p className="text-[9px] text-gray-400 leading-tight">New field 'tax_id' added to production.doc_users</p>
                    </div>
                  </div>
                </div>

                {/* Living Docs Mock */}
                <div className="aspect-square rounded-2xl bg-gray-900 border border-white/10 p-6 flex flex-col overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent"></div>
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">Living Docs</span>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 w-3/4 bg-gray-800 rounded"></div>
                      <div className="space-y-1.5">
                        <div className="h-1.5 w-full bg-gray-800/50 rounded"></div>
                        <div className="h-1.5 w-full bg-gray-800/50 rounded"></div>
                        <div className="h-1.5 w-2/3 bg-gray-800/50 rounded"></div>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-purple-500/20 border border-purple-500/30">
                        <Check className="w-2.5 h-2.5 text-purple-400" />
                        <span className="text-[9px] text-purple-300 font-medium">Updated by AI Agent</span>
                      </div>
                    </div>
                    <div className="mt-auto border-t border-white/5 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-[10px]">🤖</div>
                        <div className="bg-gray-800 rounded-lg p-2 flex-1">
                          <div className="h-1 w-12 bg-gray-600 rounded mb-1"></div>
                          <div className="h-1 w-20 bg-gray-700 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Observability Mock */}
                <div className="aspect-square rounded-2xl bg-gray-900 border border-white/10 p-6 flex flex-col overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent"></div>
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Product Health</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="text-3xl font-bold text-white mb-1">98.4<span className="text-emerald-400 text-sm">%</span></div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-medium mb-6">Quality Score</div>
                      <div className="flex items-end gap-1 h-12">
                        {[40, 70, 45, 90, 65, 80, 95, 75].map((h, i) => (
                          <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-sm relative group/bar">
                            <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/40 rounded-t-sm transition-all group-hover/bar:bg-emerald-400" style={{ height: `${h}%` }}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 flex gap-2">
                      <div className="flex-1 h-1 bg-emerald-500/20 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-full"></div>
                      </div>
                      <div className="flex-1 h-1 bg-emerald-500/20 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[80%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Follow-up Mock */}
                <div className="aspect-square rounded-2xl bg-gray-900 border border-white/10 p-6 flex flex-col overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent"></div>
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      <span className="text-[10px] font-mono text-orange-400 uppercase tracking-widest">Autonomous Action</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-[8px]">🤖</div>
                        <div className="bg-gray-800 rounded-2xl rounded-tl-none p-3 flex-1">
                          <div className="h-1 w-full bg-gray-600 rounded mb-1"></div>
                          <div className="h-1 w-2/3 bg-gray-600 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 flex-row-reverse">
                        <div className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-[8px]">👤</div>
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl rounded-tr-none p-3 flex-1">
                          <div className="h-1 w-full bg-orange-300/30 rounded mb-1"></div>
                          <div className="h-1 w-1/2 bg-orange-300/30 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-auto bg-black/40 border border-white/5 rounded-lg p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                        <span className="text-[9px] text-gray-400">Issue Resolved</span>
                      </div>
                      <span className="text-[8px] font-mono text-gray-600">via Slack</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="bottom-waitlist" className="py-32 bg-gray-900 relative overflow-hidden isolate">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.15),transparent_70%)]"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 tracking-tight">
            Stop firefighting. <span className="electric-text">Start managing.</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Join the waitlist today and get early access to the platform that's turning Data Products into autonomous assets.
          </p>
          <div className="max-w-md mx-auto">
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-black relative overflow-hidden isolate">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Common <span className="electric-text">Questions</span>
            </h2>
            <p className="text-gray-500 text-lg">Everything you need to know about the platform.</p>
          </div>
          
          <div className="space-y-2">
            {[
              {
                q: "What is an AI-agentic Data Product?",
                a: "It's a data asset with an autonomous \"brain\" that proactively monitors its own health, updates documentation, and alerts you when something breaks. Manual upkeep is a thing of the past."
              },
              {
                q: "How does the agent communicate with my team?",
                a: "The agent integrates directly with Slack, Email, and Jira. When it detects a schema drift or quality issue, it doesn't just send an alert—it reaches out to the specific person responsible for the change to resolve it autonomously."
              },
              {
                q: "Does Gala11 replace my existing data catalog?",
                a: "No, it works alongside Snowflake, BigQuery, and Databricks. While catalogs are great for static documentation, Gala11 provides an active management layer that keeps your data products business-ready."
              },
              {
                q: "Is my data secure?",
                a: "Yes. Gala11 primarily processes metadata and schema information. Your actual row-level data stays in your secure cloud environment at all times. We only see the structure, not the content."
              },
              {
                q: "How long does setup take?",
                a: "Under 5 minutes. You can connect your first data source and have an autonomous agent monitoring your products immediately without complex configuration."
              }
            ].map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Section Separator */}
      <div className="bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Gala11. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
