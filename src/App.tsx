import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"; // Consolidated imports
import "./App.css";
import "./index.css";
import "@mysten/dapp-kit/dist/index.css";
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getFullnodeUrl } from "@mysten/sui/client";

import MindSearchPage from "./MindSearchPage";
import MindYieldPage from "./MindYieldPage";
import MindSwapPage from "./MindSwapPage";
import MindExchangePage from "./MindExchangePage";

// Network configuration for Sui
const { networkConfig } = createNetworkConfig({
  localnet: { url: getFullnodeUrl("localnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});

// Query client for react-query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="localnet">
        <WalletProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/mind-search" element={<MindSearchPage />} />
              <Route path="/mind-yield" element={<MindYieldPage />} />
              <Route path="/mind-swap" element={<MindSwapPage />} />
              <Route path="/mind-exchange" element={<MindExchangePage />} />
            </Routes>
            <Footer />
          </Router>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

// Navbar Component
function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <img src="Design_2.png" alt="Sui Mind Logo" className="logo-image" />
        Sui Mind
      </Link>
      <ul className="nav-links">
        <li>
          <Link to="/mind-search">Mind Search</Link>
        </li>
        <li>
          <Link to="/mind-yield">Mind Yield</Link>
        </li>
        <li>
          <Link to="/mind-swap">Mind Swap</Link>
        </li>
        <li>
          <Link to="/mind-exchange">Mind Exchange</Link>
        </li>
      </ul>
      <button className="wallet-button" onClick={connectWallet}>
        Connect Wallet
      </button>
    </nav>
  );
}

// HomePage Component for Root "/"
function HomePage() {
  return (
    <div>
      <HeroSection />
      <CombinedSection />
    </div>
  );
}

// Hero Section
function HeroSection() {
  const handleExploreClick = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="hero">
      <h1>Sui Mind - AI Meets Blockchain</h1>
      <p>Revolutionizing AI Applications on the Sui Network</p>
      <button onClick={handleExploreClick} className="cta-button">
        Explore Sui Mind
      </button>
    </section>
  );
}

// Combined Section (Features, Community, Contact)
function CombinedSection() {
  return (
    <section id="combined-section" className="combined-section">
      <Features />
      <Community />
      <Contact />
    </section>
  );
}

// Features Section
function Features() {
  return (
    <div id="features" className="features">
      <h2>The SUI Mind Application Stack</h2>
      <div className="grid-container">
        <Feature
          title="Mind Search"
          description="Sui Mind is a sophisticated AI-powered search engine that leverages the Sui blockchain to deliver real-time, secure, and highly accurate search results tailored for you."
        />
        <Feature
          title="Mind Yield"
          description="Earn attractive yields by staking your tokens, providing liquidity to LP pools, participating in yield farms, and planned airdrops."
        />
        <Feature
          title="Mind Swap"
          description="Sui Mind integrates a token swapping platform that allows users to trade various tokens on the Sui blockchain. Sui Mind token holders ($SUI-M) enjoy reduced transaction fees, enhancing the affordability and convenience of asset management."
        />
        <Feature
          title="Mind Exchange"
          description="The AI Agent Marketplace serves as a decentralized hub for developers to showcase, trade, and deploy AI agents. Powered by smart contracts, this marketplace ensures secure transactions, transparent ratings, and royalties for AI creators."
        />
      </div>
    </div>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="feature">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

// Community Section
function Community() {
  return (
    <div className="community">
      <h2>Community</h2>
      <p>Join the Sui Mind community for updates and collaboration.</p>
      <div className="social-icons">
        <a
          href="https://x.com/Sui__Mind"
          target="_blank"
          rel="noreferrer"
          className="social-icon"
        >
          Follow us on
          <img src="X logo.png" alt="X Logo" className="x-logo" />
        </a>
      </div>
    </div>
  );
}

// Contact Section
function Contact() {
  return (
    <div id="contact" className="contact">
      <h2>Contact Us</h2>
      <p>
        We'd love to hear from you. Fill out the form below to get in touch!
      </p>
      <form id="contactForm" action="contact.php" method="POST">
        <input type="email" name="email" placeholder="Your Email" required />
        <textarea name="message" placeholder="Your Message" required />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

// Footer
function Footer() {
  return (
    <footer>
      <p>© 2025 Sui Mind. All rights reserved.</p>
    </footer>
  );
}

function connectWallet() {
  alert("Wallet connection functionality coming soon!");
}

export default App;
