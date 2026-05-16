import { GraduationCap, Github, Twitter, Linkedin, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <GraduationCap size={18} className="text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Nexus<span className="text-primary">Academy</span></span>
            </Link>
            <p className="text-small text-muted-foreground leading-relaxed mb-6">
              Empowering learners worldwide with world-class education and cutting-edge courses. Start your learning journey today.
            </p>
            <div className="flex gap-4">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Github size={20} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Twitter size={20} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Linkedin size={20} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Facebook size={20} />
                </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-3">Platform</h4>
            <ul className="space-y-2 text-small text-muted-foreground">
              <li><Link to="/courses" className="hover:text-primary transition-colors">Browse Courses</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/instructor" className="hover:text-primary transition-colors">Become an Instructor</Link></li>
              <li><Link to="/signup" className="hover:text-primary transition-colors">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Support</h4>
            <ul className="space-y-2 text-small text-muted-foreground">
              <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/verify-certificate" className="hover:text-primary transition-colors">Verify Certificate</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2 text-small text-muted-foreground">
              <li><Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-center items-center gap-4 text-small text-muted-foreground">
          <p>© {new Date().getFullYear()} NexusAcademy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
