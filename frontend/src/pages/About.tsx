import MainLayout from "@/layouts/MainLayout";
import ScrollReveal from "@/components/ScrollReveal";
import _3ATEF from "@/assets/3atef.jpg";
import ehab from "@/assets/ehab.jpg";
import fawzy from "@/assets/fawzy.jpg";
import ziad from "@/assets/zyad.jpg";
import mariam from "@/assets/mariam.jpeg";

const culprits = [
  {
    name: "Abdelrahman Ashraf",
    bio: "The Human Merge Conflict. Does nothing for a week, pushes 400 changes, then acts confused when everyone hates him.",
    image: _3ATEF,
    linkedin: "https://www.linkedin.com/in/abdelrahman-ashraf-fathey/",
  },
  {
    name: "Mazen Fawzy",
    bio: "Sleeps for 23 hours a day. During the 1 hour he's awake, he somehow breaks the production server.",
    image: fawzy,
    linkedin: "https://www.linkedin.com/in/mazenfawzy895/",
  },
  {
    name: "Mohamed Ehab",
    bio: "A true HTML visionary. Once wrote a <marquee> tag so powerful it crashed the user's browser.",
    image: ehab,
    linkedin: "https://www.linkedin.com/in/mohamed-ehab-2661a5354/",
  },
  {
    name: "Ziad Mostafa",
    bio: "The 'Full Stack Claud' specialist. He doesn't just deploy to the cloud; he becomes the cloud.",
    image: ziad,
    linkedin: "https://github.com/Zeyad172",
  },
  {
    name: "Mariam Salem",
    bio: "The secret manager. Spends most of her time hiding the keyboards so the others can't break anything.",
    image: mariam,
    linkedin: "https://www.linkedin.com/in/mariam-salem-736b3721a/",
  },
];

const About = () => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] py-12">
        <ScrollReveal animation="fade-in">
          <div className="text-center mb-16">
            <h1 className="text-5xl lg:text-7xl font-black mb-4 tracking-tighter">
              WHO <span className="text-primary">DID</span> THIS?
            </h1>
          </div>
        </ScrollReveal>

        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5 max-w-7xl px-6">
          {culprits.map((person, i) => (
            <ScrollReveal key={person.name} animation="slide-up" delay={i * 100}>
              <a 
                href={person.linkedin} 
                target="_blank" 
                rel="noreferrer" 
                className="group text-center block transition-transform hover:scale-105"
              >
                <div className="relative mb-6 inline-block">
                  <div className="absolute inset-0 bg-primary rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
                  <img 
                    src={person.image} 
                    alt={person.name} 
                    className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-background shadow-xl  group-hover:grayscale-0 transition-all duration-500"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${person.name}&background=random&size=256`;
                    }}
                  />
                </div>
                <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{person.name}</h2>
                <p className="text-muted-foreground text-xs max-w-[180px] mx-auto italic">
                  "{person.bio}"
                </p>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default About;
