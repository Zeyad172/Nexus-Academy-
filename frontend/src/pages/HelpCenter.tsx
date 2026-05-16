import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  HelpCircle,
  Book,
  CreditCard,
  User,
  Video,
  Mail,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const helpCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Book,
    questions: [
      {
        q: "How do I create an account?",
        a: "Click the 'Sign Up' button on the homepage, fill in your details (name, email, password), and verify your email to get started.",
      },
      {
        q: "How do I enroll in a course?",
        a: "Browse our course catalog, select a course you like, click 'Enroll Now', and follow the payment instructions if required.",
      },
      {
        q: "What are the system requirements?",
        a: "You need a modern web browser (Chrome, Firefox, Safari, or Edge), a stable internet connection, and audio output for video lessons.",
      },
    ],
  },
  {
    id: "account",
    title: "Account & Profile",
    icon: User,
    questions: [
      {
        q: "How do I reset my password?",
        a: "Go to the login page, click 'Forgot Password', enter your email, and follow the reset instructions sent to your inbox.",
      },
      {
        q: "How do I update my profile information?",
        a: "Navigate to Settings in your dashboard, click on Profile, and update your name, bio, profile picture, or other details.",
      },
      {
        q: "Can I have both student and instructor accounts?",
        a: "Yes! You can switch between student and instructor roles. Go to Settings and enable Instructor mode to start teaching.",
      },
    ],
  },
  {
    id: "courses",
    title: "Courses & Learning",
    icon: Video,
    questions: [
      {
        q: "How do I access course content?",
        a: "Go to My Courses in your dashboard, select a course, and click on any lesson to start learning.",
      },
      {
        q: "Can I download course videos for offline viewing?",
        a: "Currently, streaming is the only option. Make sure you have a stable internet connection when viewing lessons.",
      },
      {
        q: "How do I get a course completion certificate?",
        a: "Complete all lessons and pass the final quiz with 70% or higher. Your certificate will be available in the Certificates section.",
      },
    ],
  },
  {
    id: "billing",
    title: "Billing & Payments",
    icon: CreditCard,
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for certain regions.",
      },
      {
        q: "How do I get a refund?",
        a: "Contact our support team within 30 days of purchase. Refunds are processed based on our refund policy.",
      },
      {
        q: "Where can I view my billing history?",
        a: "Go to Settings > Billing in your dashboard to view all your transactions and download invoices.",
      },
    ],
  },
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    setExpandedCategory(id);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  const toggleCategory = (id: string) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  const toggleQuestion = (id: string) => {
    setExpandedQuestion(expandedQuestion === id ? null : id);
  };

  const filteredCategories = helpCategories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-gradient-to-b from-primary/5 via-primary/10 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <GraduationCap size={22} className="text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Nexus<span className="text-primary">Academy</span>
              </span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              How can we <span className="gradient-text">help you?</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Search our knowledge base or browse categories below
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-background/80 backdrop-blur-sm border-border focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          <button
            onClick={() => alert("AI Assistant Coming Soon!")}
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-md group text-left"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Bot className="text-primary" size={24} />
            </div>
            <h3 className="font-semibold text-foreground">AI Assistant</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Ask anything about Nexus
            </p>
          </button>
          {helpCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => scrollToSection(category.id)}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-md group text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <category.icon className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-foreground">
                {category.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {category.questions.length} articles
              </p>
            </button>
          ))}
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              id={category.id}
              className="bg-card border border-border rounded-xl overflow-hidden scroll-mt-28"
            >
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <category.icon className="text-primary" size={20} />
                  <span className="font-semibold text-foreground">
                    {category.title}
                  </span>
                </div>
                {expandedCategory === category.id ? (
                  <ChevronDown className="text-muted-foreground" size={20} />
                ) : (
                  <ChevronRight className="text-muted-foreground" size={20} />
                )}
              </button>

              {expandedCategory === category.id && (
                <div className="border-t border-border">
                  {category.questions.map((question, index) => {
                    const questionId = `${category.id}-${index}`;
                    return (
                      <div
                        key={questionId}
                        className="border-b border-border last:border-b-0"
                      >
                        <button
                          onClick={() => toggleQuestion(questionId)}
                          className="w-full flex items-center justify-between p-4 pl-8 hover:bg-muted/30 transition-colors text-left"
                        >
                          <span className="text-sm font-medium text-foreground pr-4">
                            {question.q}
                          </span>
                          {expandedQuestion === questionId ? (
                            <ChevronDown
                              className="text-muted-foreground flex-shrink-0"
                              size={16}
                            />
                          ) : (
                            <ChevronRight
                              className="text-muted-foreground flex-shrink-0"
                              size={16}
                            />
                          )}
                        </button>
                        {expandedQuestion === questionId && (
                          <div className="px-8 pb-4 text-sm text-muted-foreground leading-relaxed">
                            {question.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No results found
            </h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find any articles matching "{searchQuery}"
            </p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          </div>
        )}

        <div className="mt-16 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Still need help?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Can't find what you're looking for? Our support team is here to
            assist you with any questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="gradient-primary border-0 text-primary-foreground hover:opacity-90">
              <Mail size={18} className="mr-2" />
              Contact Support
            </Button>
            <Link to="/courses">
              <Button variant="outline" size="lg" className="rounded-full">
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
