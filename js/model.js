/* =====================================================================
   MODEL — the data and state of the app. Never touches the DOM.
   Edit your content here: featured projects, skills, image overrides.
   ===================================================================== */

const Model = {

  githubUser: "Mehrxn",

  // Where the contact form delivers (via formsubmit.co relay)
  contactEmail: "u2shakeeb@gmail.com",

  // App state (read/written by the Controller, displayed by the View)
  state: {
    screen: "home",        // which screen is showing
    menuIndex: 0,          // selected item on the home menu
    reposLoaded: false,
    skillsBuilt: false,
  },

  // ---- Featured projects (hand-written, shown in the showcase) ----
  featured: [
    {
      title: "ASTROSAFE",
      tag: "1st Place · AI Track", color: "#3dc8ff", live: true,
      url: "https://github.com/Ibrahim-Nazeer/astro-safe", cta: "View on GitHub →",
      img: "assets/projects/astrosafe.png",
      award: "HackAura Winner",
      tech: "Python · YOLOv8 · OpenCV · Gradio · Vercel",
      desc: "Space Station Safety Object Detection. Solo trained and fine-tuned a YOLOv8 object detection model on ~2.5K labeled space-station images (79% mAP@50, 66% mAP@50-95, 92% precision, 71% recall). Engineered the end-to-end inference pipeline with OpenCV image processing/annotation and Gradio UI, integrated with Duality AI Falcon virtual camera feeds and deployed on Vercel.",
    },
    {
      title: "KRONOS",
      tag: "2nd Place · Quackathon", color: "#ff3b30", live: false,
      url: "https://github.com/Mehrxn/quackathon-Kronos", cta: "View on GitHub →",
      img: "assets/projects/kronos.png",
      award: "Quackathon 2026 Winner",
      tech: "Python · FastAPI · LLMs · Grafana · Loki · Docker · Parcle",
      desc: "Autonomous Incident Response SRE Agent. Contributed to an autonomous agent that parses production alerts, retrieves relevant code context, and produces LLM-driven root cause diagnoses as automated PRs or GitHub issue escalations. Integrated Grafana & Loki for real-time alert ingestion/log retrieval, containerized services with Docker, and helped build Parcle, a persistent incident-memory layer that fingerprints incidents to cut redundant investigation.",
    },
    {
      title: "VISNEUCLA",
      tag: "MCP Platform", color: "#f1e05a", live: false,
      url: "https://github.com/Nurysso/Vis-Neuclea", cta: "View on GitHub →",
      img: "assets/projects/visneucla.png",
      award: "Conversational Agent Platform",
      tech: "Go · TypeScript · Model Context Protocol (MCP) · WebSockets · ReAct",
      desc: "OpenAPI-to-MCP Conversational Agent Platform. Built the TypeScript OpenAPI parser for Vis that converts OpenAPI 3.x specifications into typed Model Context Protocol (MCP) servers for a Go-based ReAct agent gateway. Contributed to an ultra-token-efficient agent architecture achieving ~5x lower token usage than traditional agents through truncated tool descriptions and required-parameter schemas.",
    },
  ],

  // Repos already shown in "featured" get hidden from the GitHub feed
  featuredRepoNames: [
    "AstroSafe",
    "Kronos",
    "VisNeucla",
    "astrosafe",
    "kronos",
    "visneucla",
    "AstroSafe-CV",
    "Kronos-SRE",
  ],

  // Shown if the GitHub API can't be reached
  fallbackRepos: [
    {
      name: "AstroSafe-Detection", language: "Python", stargazers_count: 5,
      html_url: "https://github.com/Ibrahim-Nazeer/astro-safe",
      description: "Space station hazard detection fine-tuned on YOLOv8 with real-time OpenCV inference and Duality AI Falcon camera streaming. 1st Place winner at HackAura.",
    },
    {
      name: "Kronos-Incident-Agent", language: "Python", stargazers_count: 4,
      html_url: "https://github.com/Mehrxn/quackathon-Kronos",
      description: "Autonomous SRE agent parsing production alerts and logs via Grafana & Loki with persistent Parcle incident-memory fingerprinting.",
    },
    {
      name: "VisNeucla-MCP-Gateway", language: "Go", stargazers_count: 3,
      html_url: "https://github.com/Nurysso/Vis-Neuclea",
      description: "Converts OpenAPI 3.x specifications into typed Model Context Protocol (MCP) servers for an ultra-token-efficient ReAct agent gateway.",
    },
    {
      name: "Agentic-Workflow-Workforce", language: "TypeScript", stargazers_count: 2,
      html_url: "https://github.com/Mehrxn",
      description: "Autonomous multi-agent orchestration architecture utilizing tool calling, LangGraph workflows, and observability monitoring.",
    },
  ],

  // Optional thumbnail overrides: repo name → image path.
  // Anything not listed is looked up at assets/projects/<RepoName>.png
  projectImages: {
    // "AstroSafe": "assets/projects/astrosafe.png",
  },

  langColors: {
    Python: "#3572A5", Go: "#00ADD8", TypeScript: "#3178c6", JavaScript: "#f7df1e",
    Java: "#b07219", C: "#555555", "C++": "#f34b7d", Ruby: "#701516", Dart: "#00B4AB",
    SQL: "#e38c00", HTML: "#e34c26", CSS: "#663399", "Jupyter Notebook": "#DA5B0B",
    Docker: "#2496ED", Shell: "#89e051",
  },

  // ---- Skills screen ----
  skills: [
    {
      group: "AI/ML & Agentic Systems", items: [
        ["YOLOv8 & OpenCV", 94],
        ["Model Context Protocol (MCP)", 92],
        ["LLMs & Prompt Engineering", 90],
        ["LangChain & LangGraph", 88],
        ["PyTorch & TensorFlow", 85],
        ["scikit-learn & Hugging Face", 84],
        ["NumPy & Pandas", 90],
      ]
    },
    {
      group: "Backend & Web Architecture", items: [
        ["FastAPI & Python", 92],
        ["RESTful APIs & WebSockets", 90],
        ["Django & Streamlit", 85],
        ["MySQL & SQL", 84],
        ["HTML5 / CSS3", 86],
      ]
    },
    {
      group: "DevOps & Observability", items: [
        ["Docker & Containerization", 90],
        ["Grafana & Prometheus", 88],
        ["Loki, Promtail & Tempo", 85],
        ["Git & GitHub Actions", 92],
        ["Linux Environments", 88],
        ["Vercel Deployment", 90],
      ]
    },
    {
      group: "Programming Languages", items: [
        ["Python", 95],
        ["C & Java", 82],
        ["SQL", 86],
        ["TypeScript & Go", 80],
        ["Ruby & Dart", 75],
      ]
    },
  ],

  // ---- Data fetching ----
  async fetchRepos() {
    const skip = new Set(this.featuredRepoNames);
    try {
      const res = await fetch(
        `https://api.github.com/users/${this.githubUser}/repos?per_page=100&sort=updated`
      );
      if (!res.ok) throw new Error(res.status);
      const repos = (await res.json()).filter(r => !r.fork && !skip.has(r.name));
      return { repos, live: true };
    } catch {
      return { repos: this.fallbackRepos.filter(r => !skip.has(r.name)), live: false };
    }
  },
};
