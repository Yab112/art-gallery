import { 
  Code2,
  Database,
  Cloud,
  Zap,
  Shield,
  Globe,
  Layers,
  Cpu,
  GitBranch,
  Box,
  Rocket,
  Sparkles,
  Palette,
  Monitor
} from "lucide-react";

// Tech stack icons with darker colors
const techStack = [
  { 
    icon: Code2, 
    name: "React",
    color: "text-blue-800"
  },
  { 
    icon: Database, 
    name: "Database",
    color: "text-blue-900"
  },
  { 
    icon: Cloud, 
    name: "Cloud",
    color: "text-green-800"
  },
  { 
    icon: Zap, 
    name: "Performance",
    color: "text-purple-800"
  },
  { 
    icon: Shield, 
    name: "Security",
    color: "text-cyan-800"
  },
  { 
    icon: Globe, 
    name: "Global",
    color: "text-orange-800"
  },
  { 
    icon: Layers, 
    name: "Layers",
    color: "text-yellow-800"
  },
  { 
    icon: Cpu, 
    name: "Processing",
    color: "text-red-800"
  },
  { 
    icon: GitBranch, 
    name: "Version Control",
    color: "text-indigo-800"
  },
  { 
    icon: Box, 
    name: "Container",
    color: "text-pink-800"
  },
  { 
    icon: Rocket, 
    name: "Deployment",
    color: "text-teal-800"
  },
  { 
    icon: Sparkles, 
    name: "Innovation",
    color: "text-gray-800"
  },
  { 
    icon: Palette, 
    name: "Design",
    color: "text-violet-800"
  },
  { 
    icon: Monitor, 
    name: "Frontend",
    color: "text-slate-800"
  },
];

export function TrustedByBusinesses() {
  // Duplicate the array for seamless infinite scroll
  const duplicatedStack = [...techStack, ...techStack];

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Trusted by Growing Businesses
          </h2>
          <p className="text-gray-600">
            Built with modern technology stack
          </p>
        </div>

        {/* Infinite scrolling container */}
        <div className="relative">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

          {/* Scrolling animation container */}
          <div className="overflow-hidden">
            <div className="flex animate-scroll gap-12">
              {duplicatedStack.map((tech, index) => {
                const Icon = tech.icon;
                return (
                  <div
                    key={`${tech.name}-${index}`}
                    className="flex-shrink-0 flex items-center justify-center group"
                  >
                    <div className="p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-110">
                      <Icon 
                        className={`h-12 w-12 ${tech.color} transition-colors duration-300`}
                        aria-label={tech.name}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

