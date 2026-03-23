
// State
let currentDomain  = "Data Science";
let currentFile    = null;
let currentResults = null;
let history        = [];
let dark           = false;
let chatOpen       = false;
let chatMinimized  = false;
let pieChart       = null;
let barChart       = null;
let radarChart     = null;

const domainIcons  = {"Data Science":"◈","Web Development":"⬡","AI/ML":"◎","DevOps":"⚙","Cybersecurity":"⬢","Mobile Development":"▣","Cloud Computing":"◉","Software Engineering":"⬟","UI/UX Design":"◆","Big Data Engineering":"▦","NLP":"◐","QA & Testing":"◑"};
const domainColors = {"Data Science":"#e11d77","Web Development":"#2563eb","AI/ML":"#7c3aed","DevOps":"#059669","Cybersecurity":"#dc2626","Mobile Development":"#d97706","Cloud Computing":"#0891b2","Software Engineering":"#4f46e5","UI/UX Design":"#db2777","Big Data Engineering":"#16a34a","NLP":"#9333ea","QA & Testing":"#ea580c"};

const companiesByDomain = {
  "Data Science":[{name:"Google",logo:"G",color:"#4285F4",roles:["Data Scientist","ML Engineer"],minScore:72,linkedin:"https://linkedin.com/jobs/search/?keywords=Data+Scientist",indeed:"https://indeed.com/q-data-scientist-google-jobs.html",site:"https://careers.google.com"},{name:"Meta",logo:"M",color:"#0866FF",roles:["Data Scientist","Analytics Eng"],minScore:68,linkedin:"https://linkedin.com/jobs/search/?keywords=Data+Scientist",indeed:"https://indeed.com/q-data-scientist-meta-jobs.html",site:"https://metacareers.com"},{name:"Netflix",logo:"N",color:"#E50914",roles:["Senior Data Scientist"],minScore:75,linkedin:"https://linkedin.com/jobs/search/?keywords=Data+Scientist",indeed:"https://indeed.com/q-data-scientist-netflix-jobs.html",site:"https://jobs.netflix.com"},{name:"Airbnb",logo:"A",color:"#FF5A5F",roles:["Data Scientist","Analytics Lead"],minScore:60,linkedin:"https://linkedin.com/jobs/search/?keywords=Data+Scientist",indeed:"https://indeed.com/q-data-scientist-airbnb-jobs.html",site:"https://careers.airbnb.com"},{name:"Spotify",logo:"S",color:"#1DB954",roles:["Data Analyst","ML Engineer"],minScore:50,linkedin:"https://linkedin.com/jobs/search/?keywords=Data+Scientist",indeed:"https://indeed.com/q-data-scientist-spotify-jobs.html",site:"https://lifeatspotify.com"}],
  "Web Development":[{name:"Shopify",logo:"S",color:"#96BF48",roles:["Frontend Eng","Full Stack Dev"],minScore:50,linkedin:"https://linkedin.com/jobs/search/?keywords=Frontend+Engineer",indeed:"https://indeed.com/q-frontend-engineer-shopify-jobs.html",site:"https://shopify.com/careers"},{name:"Stripe",logo:"S",color:"#635BFF",roles:["Frontend Eng","UI Engineer"],minScore:65,linkedin:"https://linkedin.com/jobs/search/?keywords=Frontend+Engineer",indeed:"https://indeed.com/q-software-engineer-stripe-jobs.html",site:"https://stripe.com/jobs"},{name:"Vercel",logo:"V",color:"#000000",roles:["Full Stack Eng","Frontend Dev"],minScore:55,linkedin:"https://linkedin.com/jobs/search/?keywords=Frontend+Engineer+Vercel",indeed:"https://indeed.com/q-software-engineer-vercel-jobs.html",site:"https://vercel.com/careers"},{name:"GitHub",logo:"G",color:"#24292F",roles:["Full Stack Dev","Backend Eng"],minScore:60,linkedin:"https://linkedin.com/jobs/search/?keywords=Software+Engineer",indeed:"https://indeed.com/q-software-engineer-github-jobs.html",site:"https://github.com/about/careers"}],
  "AI/ML":[{name:"OpenAI",logo:"O",color:"#00A67E",roles:["Research Eng","ML Engineer"],minScore:75,linkedin:"https://linkedin.com/jobs/search/?keywords=ML+Engineer",indeed:"https://indeed.com/q-ml-engineer-openai-jobs.html",site:"https://openai.com/careers"},{name:"Anthropic",logo:"A",color:"#C76B39",roles:["Research Scientist","ML Researcher"],minScore:78,linkedin:"https://linkedin.com/jobs/search/?keywords=Research+Scientist+AI",indeed:"https://indeed.com/q-ai-researcher-anthropic-jobs.html",site:"https://anthropic.com/careers"},{name:"DeepMind",logo:"D",color:"#4285F4",roles:["Research Scientist","AI Engineer"],minScore:80,linkedin:"https://linkedin.com/jobs/search/?keywords=AI+Research+Engineer",indeed:"https://indeed.com/q-ai-research-deepmind-jobs.html",site:"https://deepmind.google/careers"},{name:"Hugging Face",logo:"H",color:"#FFD21E",roles:["ML Engineer","Open Source Dev"],minScore:55,linkedin:"https://linkedin.com/jobs/search/?keywords=ML+Engineer+Hugging+Face",indeed:"https://indeed.com/q-ml-engineer-hugging-face-jobs.html",site:"https://apply.workable.com/huggingface"}],
  "DevOps":[{name:"HashiCorp",logo:"H",color:"#7B42BC",roles:["DevOps Eng","Platform Eng"],minScore:55,linkedin:"https://linkedin.com/jobs/search/?keywords=DevOps+Engineer",indeed:"https://indeed.com/q-devops-engineer-hashicorp-jobs.html",site:"https://hashicorp.com/careers"},{name:"Datadog",logo:"D",color:"#632CA6",roles:["SRE","Cloud Engineer"],minScore:58,linkedin:"https://linkedin.com/jobs/search/?keywords=SRE",indeed:"https://indeed.com/q-sre-datadog-jobs.html",site:"https://datadoghq.com/careers"},{name:"AWS",logo:"A",color:"#FF9900",roles:["Cloud Architect","DevOps Eng"],minScore:65,linkedin:"https://linkedin.com/jobs/search/?keywords=DevOps+AWS",indeed:"https://indeed.com/q-devops-engineer-amazon-jobs.html",site:"https://aws.amazon.com/careers"},{name:"GitLab",logo:"G",color:"#FC6D26",roles:["SRE","DevOps Engineer"],minScore:50,linkedin:"https://linkedin.com/jobs/search/?keywords=DevOps",indeed:"https://indeed.com/q-devops-gitlab-jobs.html",site:"https://about.gitlab.com/jobs"}],
  "Cybersecurity":[{name:"CrowdStrike",logo:"C",color:"#E41E2B",roles:["Security Eng","Threat Analyst"],minScore:60,linkedin:"https://linkedin.com/jobs/search/?keywords=Security+Engineer",indeed:"https://indeed.com/q-security-engineer-crowdstrike-jobs.html",site:"https://crowdstrike.com/careers"},{name:"Palo Alto",logo:"P",color:"#00B4E0",roles:["Security Analyst","Pen Tester"],minScore:55,linkedin:"https://linkedin.com/jobs/search/?keywords=Security+Analyst",indeed:"https://indeed.com/q-security-analyst-palo-alto-jobs.html",site:"https://paloaltonetworks.com/company/careers"},{name:"Okta",logo:"O",color:"#00297A",roles:["Security Eng","SOC Analyst"],minScore:52,linkedin:"https://linkedin.com/jobs/search/?keywords=Security+Engineer",indeed:"https://indeed.com/q-security-engineer-okta-jobs.html",site:"https://okta.com/company/careers"}],
  "Mobile Development":[{name:"Uber",logo:"U",color:"#000000",roles:["iOS Engineer","Android Eng"],minScore:60,linkedin:"https://linkedin.com/jobs/search/?keywords=Mobile+Engineer",indeed:"https://indeed.com/q-mobile-engineer-uber-jobs.html",site:"https://uber.com/careers"},{name:"Lyft",logo:"L",color:"#FF00BF",roles:["Mobile Eng","Flutter Dev"],minScore:55,linkedin:"https://linkedin.com/jobs/search/?keywords=Mobile+Developer",indeed:"https://indeed.com/q-mobile-engineer-lyft-jobs.html",site:"https://lyft.com/careers"},{name:"Duolingo",logo:"D",color:"#58CC02",roles:["iOS Developer","Android Dev"],minScore:50,linkedin:"https://linkedin.com/jobs/search/?keywords=Mobile+Developer",indeed:"https://indeed.com/q-mobile-developer-duolingo-jobs.html",site:"https://careers.duolingo.com"}],
  "Cloud Computing":[{name:"AWS",logo:"A",color:"#FF9900",roles:["Cloud Architect"],minScore:65,linkedin:"https://linkedin.com/jobs/search/?keywords=Cloud+Engineer+AWS",indeed:"https://indeed.com/q-cloud-engineer-amazon-jobs.html",site:"https://aws.amazon.com/careers"},{name:"Microsoft Azure",logo:"M",color:"#0078D4",roles:["Cloud Eng","Azure Architect"],minScore:62,linkedin:"https://linkedin.com/jobs/search/?keywords=Cloud+Engineer+Azure",indeed:"https://indeed.com/q-azure-cloud-engineer-microsoft-jobs.html",site:"https://careers.microsoft.com"},{name:"Google Cloud",logo:"G",color:"#4285F4",roles:["Cloud Eng","SRE"],minScore:62,linkedin:"https://linkedin.com/jobs/search/?keywords=Cloud+Engineer+GCP",indeed:"https://indeed.com/q-gcp-cloud-engineer-google-jobs.html",site:"https://careers.google.com"}],
  "Software Engineering":[{name:"Microsoft",logo:"M",color:"#0078D4",roles:["Software Eng","Principal Eng"],minScore:62,linkedin:"https://linkedin.com/jobs/search/?keywords=Software+Engineer",indeed:"https://indeed.com/q-software-engineer-microsoft-jobs.html",site:"https://careers.microsoft.com"},{name:"Apple",logo:"A",color:"#555555",roles:["Software Eng","iOS Engineer"],minScore:68,linkedin:"https://linkedin.com/jobs/search/?keywords=Software+Engineer",indeed:"https://indeed.com/q-software-engineer-apple-jobs.html",site:"https://apple.com/careers"},{name:"Amazon",logo:"A",color:"#FF9900",roles:["SDE","Software Engineer"],minScore:65,linkedin:"https://linkedin.com/jobs/search/?keywords=Software+Engineer",indeed:"https://indeed.com/q-software-engineer-amazon-jobs.html",site:"https://amazon.jobs"}],
  "UI/UX Design":[{name:"Figma",logo:"F",color:"#A259FF",roles:["Product Designer","UX Designer"],minScore:55,linkedin:"https://linkedin.com/jobs/search/?keywords=Product+Designer",indeed:"https://indeed.com/q-product-designer-figma-jobs.html",site:"https://figma.com/careers"},{name:"Adobe",logo:"A",color:"#FF0000",roles:["UX Designer","Design Systems"],minScore:58,linkedin:"https://linkedin.com/jobs/search/?keywords=UX+Designer",indeed:"https://indeed.com/q-ux-designer-adobe-jobs.html",site:"https://adobe.com/careers.html"},{name:"Canva",logo:"C",color:"#00C4CC",roles:["Product Designer","UX Researcher"],minScore:50,linkedin:"https://linkedin.com/jobs/search/?keywords=Product+Designer",indeed:"https://indeed.com/q-product-designer-canva-jobs.html",site:"https://canva.com/careers"}],
  "Big Data Engineering":[{name:"Databricks",logo:"D",color:"#FF3621",roles:["Data Eng","Spark Eng"],minScore:60,linkedin:"https://linkedin.com/jobs/search/?keywords=Data+Engineer",indeed:"https://indeed.com/q-data-engineer-databricks-jobs.html",site:"https://databricks.com/company/careers"},{name:"Snowflake",logo:"S",color:"#29B5E8",roles:["Data Platform Eng","ETL Dev"],minScore:55,linkedin:"https://linkedin.com/jobs/search/?keywords=Data+Engineer",indeed:"https://indeed.com/q-data-engineer-snowflake-jobs.html",site:"https://careers.snowflake.com"},{name:"Confluent",logo:"C",color:"#0088CC",roles:["Data Eng","Kafka Engineer"],minScore:58,linkedin:"https://linkedin.com/jobs/search/?keywords=Data+Engineer+Kafka",indeed:"https://indeed.com/q-data-engineer-confluent-jobs.html",site:"https://confluent.io/careers"}],
  "NLP":[{name:"OpenAI",logo:"O",color:"#00A67E",roles:["NLP Research Eng","ML Eng"],minScore:72,linkedin:"https://linkedin.com/jobs/search/?keywords=NLP+Engineer",indeed:"https://indeed.com/q-nlp-engineer-openai-jobs.html",site:"https://openai.com/careers"},{name:"Cohere",logo:"C",color:"#39594D",roles:["NLP Eng","Research Scientist"],minScore:60,linkedin:"https://linkedin.com/jobs/search/?keywords=NLP+Engineer",indeed:"https://indeed.com/q-nlp-engineer-cohere-jobs.html",site:"https://cohere.com/careers"},{name:"Grammarly",logo:"G",color:"#15C39A",roles:["NLP Eng","ML Engineer"],minScore:58,linkedin:"https://linkedin.com/jobs/search/?keywords=NLP+Engineer",indeed:"https://indeed.com/q-nlp-engineer-grammarly-jobs.html",site:"https://grammarly.com/jobs"}],
  "QA & Testing":[{name:"Sauce Labs",logo:"S",color:"#E2231A",roles:["QA Eng","Test Architect"],minScore:45,linkedin:"https://linkedin.com/jobs/search/?keywords=QA+Engineer",indeed:"https://indeed.com/q-qa-engineer-sauce-labs-jobs.html",site:"https://saucelabs.com/company/careers"},{name:"BrowserStack",logo:"B",color:"#F26522",roles:["SDET","Automation Eng"],minScore:48,linkedin:"https://linkedin.com/jobs/search/?keywords=SDET+BrowserStack",indeed:"https://indeed.com/q-sdet-browserstack-jobs.html",site:"https://browserstack.com/careers"},{name:"Atlassian",logo:"A",color:"#0052CC",roles:["QA Eng","Test Lead"],minScore:52,linkedin:"https://linkedin.com/jobs/search/?keywords=QA+Engineer",indeed:"https://indeed.com/q-qa-engineer-atlassian-jobs.html",site:"https://atlassian.com/company/careers"}],
};

const jobPlatforms = [
  {name:"LinkedIn",icon:"IN",color:"#0A66C2",bg:"rgba(10,102,194,.12)",desc:"Professional network",url:d=>`https://linkedin.com/jobs/search/?keywords=${encodeURIComponent(d)}`},
  {name:"Indeed",icon:"ID",color:"#003A9B",bg:"rgba(0,58,155,.1)",desc:"Millions of listings",url:d=>`https://indeed.com/jobs?q=${encodeURIComponent(d)}`},
  {name:"Glassdoor",icon:"GD",color:"#0CAA41",bg:"rgba(12,170,65,.1)",desc:"Salaries & reviews",url:d=>`https://glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(d)}`},
  {name:"Wellfound",icon:"WF",color:"#FB651E",bg:"rgba(251,101,30,.1)",desc:"Startup roles",url:d=>`https://wellfound.com/jobs?q=${encodeURIComponent(d)}`},
  {name:"Dice",icon:"DC",color:"#EB1C26",bg:"rgba(235,28,38,.1)",desc:"Tech specialists",url:d=>`https://dice.com/jobs?q=${encodeURIComponent(d)}`},
  {name:"We Work Remotely",icon:"WR",color:"#1F8A70",bg:"rgba(31,138,112,.1)",desc:"Remote roles",url:d=>`https://weworkremotely.com/remote-jobs/search?term=${encodeURIComponent(d)}`},
];

// Init
document.addEventListener("DOMContentLoaded", () => {
  buildDomainGrid();
  updateChips();
  showPage("home");
});

// Theme
function toggleTheme() {
  dark = !dark;
  document.body.className = dark ? "dark" : "light";
  document.getElementById("themeToggle").textContent = dark ? "☀️" : "🌙";
  if (currentResults) rebuildCharts(currentResults);
}

// Pages
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => { p.classList.remove("active"); });
  const pg = document.getElementById("page-" + id);
  if (pg) { pg.classList.add("active"); pg.classList.add("fadeup"); setTimeout(() => pg.classList.remove("fadeup"), 500); }
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  const nb = document.querySelector(`[data-page="${id}"]`);
  if (nb) nb.classList.add("active");
  if (id === "history") renderHistory();
}

// Domain Grid
function buildDomainGrid() {
  const domains = Object.keys(domainColors);
  const grid = document.getElementById("domainGrid");
  grid.innerHTML = "";
  domains.forEach(d => {
    const btn = document.createElement("button");
    btn.className = "domain-btn" + (d === currentDomain ? " active" : "");
    btn.style.cssText = d === currentDomain
      ? `color:${domainColors[d]};border-color:${domainColors[d]}60;background:${domainColors[d]}10`
      : "";
    btn.innerHTML = `<span class="domain-icon" style="color:${d===currentDomain?domainColors[d]:'var(--text-muted)'}">${domainIcons[d]}</span>${d}`;
    btn.onclick = () => selectDomain(d);
    grid.appendChild(btn);
  });
}

function selectDomain(d) {
  currentDomain = d;
  buildDomainGrid();
  const dz = document.getElementById("dropzone");
  dz.style.borderColor = domainColors[d] + "60";
}

// File Upload
function onFileSelect(e) {
  const f = e.target.files[0];
  if (!f) return;
  if (!/\.(pdf|docx|txt)$/i.test(f.name)) {
    showError("❌ Invalid file type: \"" + f.name + "\"\n\nOnly PDF, DOCX, or TXT files are accepted.\nImages (PNG, JPG, etc.) and other formats are not supported.");
    e.target.value = ""; // reset input
    return;
  }
  setFile(f);
}

function onDragOver(e) {
  e.preventDefault();
  document.getElementById("dropzone").classList.add("drag-over");
}

function onDragLeave() {
  document.getElementById("dropzone").classList.remove("drag-over");
}

function onDrop(e) {
  e.preventDefault();
  document.getElementById("dropzone").classList.remove("drag-over");
  const f = e.dataTransfer.files[0];
  if (!f) return;
  if (/\.(png|jpg|jpeg|gif|bmp|webp|svg|tiff|ico|heic)$/i.test(f.name)) {
    showError("❌ Images are not supported.\n\nThis is a resume analyzer — please upload your resume as a PDF, DOCX, or TXT file, not an image.");
    return;
  }
  if (!/\.(pdf|docx|txt)$/i.test(f.name)) {
    showError("❌ Invalid file type: \"" + f.name + "\"\n\nOnly these formats are accepted:\n• PDF (.pdf)\n• Word Document (.docx)\n• Plain Text (.txt)");
    return;
  }
  setFile(f);
}

function setFile(f) {
  currentFile = f;
  const dc = domainColors[currentDomain];
  const dz = document.getElementById("dropzone");
  dz.classList.add("has-file");
  dz.style.borderColor = dc + "60";
  dz.style.background = dc + "04";
  document.getElementById("dropContent").innerHTML = `
    <div class="drop-file-icon" style="background:${dc}12;border:1px solid ${dc}25">📄</div>
    <div class="drop-file-name">${f.name}</div>
    <div class="drop-file-size" style="color:${dc}">${(f.size/1024).toFixed(1)} KB · Click to replace</div>
  `;
  document.getElementById("analyzeBtn").disabled = false;
  hideError();
}

function showError(msg) {
  const el = document.getElementById("uploadError");
  // Convert newlines to <br> for display
  el.innerHTML = msg.replace(/\n/g, "<br>");
  el.classList.remove("hidden");
}
function hideError() {
  document.getElementById("uploadError").classList.add("hidden");
}

// Job Description (Step 3 - Optional)

function onJobDescriptionInput() {
    var text     = document.getElementById("jobDescription").value;
    var count    = text.trim().length;
    var charEl   = document.getElementById("jdCharCount");
    var statusEl = document.getElementById("jdStatus");
    var clearBtn = document.getElementById("jdClearBtn");

    charEl.textContent     = count.toLocaleString() + " characters";
    clearBtn.style.display = count > 0 ? "block" : "none";

    if (count === 0) {
        statusEl.textContent = "";
        statusEl.className   = "jd-status";
    } else if (count < 100) {
        statusEl.textContent = "⚠ Too short — paste the full job description";
        statusEl.className   = "jd-status short";
    } else {
        var words = (text.toLowerCase().match(/\b\w{3,}\b/g) || []).length;
        statusEl.textContent = "✓ Ready — " + words + " words detected";
        statusEl.className   = "jd-status ready";
    }
}

function clearJobDescription() {
    document.getElementById("jobDescription").value = "";
    onJobDescriptionInput();
}

// Analyze
async function analyzeResume() {
  if (!currentFile) { showError("Please upload a resume file first."); return; }

  // Client-side file type guard (triple check)
  if (!/\.(pdf|docx|txt)$/i.test(currentFile.name)) {
    showError("❌ Invalid file type: \"" + currentFile.name + "\"\n\nOnly PDF, DOCX, or TXT files are accepted.");
    return;
  }
  const blockedMimeTypes = ["image/","video/","audio/"];
  if (blockedMimeTypes.some(m => (currentFile.type || "").startsWith(m))) {
    showError("❌ \"" + currentFile.name + "\" is not a resume file.\n\nPlease upload a PDF, DOCX, or TXT file.");
    return;
  }

  // Client-side empty file check BEFORE sending to server
  if (currentFile.size === 0) {
    showError("❌ The file is empty (0 bytes). Please upload a resume with actual content.");
    return;
  }
  if (currentFile.size < 50) {
    showError("❌ The file is too small to be a real resume. Please upload a complete resume file.");
    return;
  }

  hideError();
  const btn = document.getElementById("analyzeBtn");
  const btnText = document.getElementById("analyzeBtnText");
  btn.disabled = true;
  btnText.innerHTML = `<span class="spin-icon"></span> Analyzing…`;

  try {
    const fd = new FormData();
    fd.append("file", currentFile);
    fd.append("domain", currentDomain);

    // Include job description if the user pasted one (it's optional)
    var jdText = (document.getElementById("jobDescription").value || "").trim();
    if (jdText.length > 0) {
        fd.append("job_description", jdText);
    }

    const resp = await fetch("/api/analyze", { method: "POST", body: fd });
    const data = await resp.json();

    // Handle empty / insufficient resume errors from backend
    if (resp.status === 422) {
      const errType = data.error;
      if (errType === "empty_resume") {
        showError(`❌ Empty Resume Detected\n\n${data.message}\n\n💡 Fix: ${data.fix}`);
      } else if (errType === "insufficient_content") {
        showError(`❌ Too Little Content\n\n${data.message}\n\n💡 ${data.detail}`);
      } else {
        showError(data.message || data.error || "Resume content is insufficient.");
      }
      return;
    }

    if (!resp.ok || data.error) {
      showError(data.error || "Analysis failed. Please try again.");
      return;
    }

    // Extra client-side guard: if score is 0 and no skills found, show helpful message
    if (data.resume_score === 0 && data.matched_skills.length === 0 && data.related_skills.length === 0) {
      showError(
        `⚠️ No relevant skills found in your resume for the "${currentDomain}" domain.\n\n` +
        `Your resume has ${data.word_count || 0} words but no matching skills were detected.\n\n` +
        `💡 Make sure your resume contains actual skills, experience, and technical keywords.`
      );
      return;
    }

    currentResults = data;
    history.unshift(data);
    if (history.length > 5) history.pop();

    document.getElementById("nav-results").classList.remove("hidden");
    document.getElementById("nav-history").classList.remove("hidden");
    renderResults(data);
    showPage("results");

  } catch (e) {
    showError("❌ Could not reach the Flask server.\n\nMake sure it is running:\n  cd backend\n  python app.py\n\nThen open http://127.0.0.1:5000");
  } finally {
    btn.disabled = false;
    btnText.innerHTML = "⬡ Analyze Resume";
  }
}

// Render Results
function renderResults(r) {
  const dc   = domainColors[r.domain] || "#7c3aed";
  const scC  = r.resume_score >= 70 ? "#16a34a" : r.resume_score >= 40 ? "#d97706" : "#dc2626";
  const scLabel = r.resume_score >= 70 ? "Strong Match" : r.resume_score >= 40 ? "Average Match" : "Needs Improvement";
  const companies  = companiesByDomain[r.domain] || [];
  const qualified  = companies.filter(c => r.resume_score >= c.minScore);
  const almost     = companies.filter(c => r.resume_score < c.minScore && r.resume_score >= c.minScore - 15);
  const noCompany  = qualified.length === 0;
  const relatedSkills = r.related_skills || [];

  // Learning platforms per domain
  const learningPlatforms = {
    "Data Science":        [{n:"Coursera",u:"https://coursera.org/search?query=data+science",c:"#0056D2",i:"C"},{n:"Udemy",u:"https://udemy.com/courses/search/?q=data+science",c:"#A435F0",i:"U"},{n:"Kaggle",u:"https://kaggle.com/learn",c:"#20BEFF",i:"K"},{n:"DataCamp",u:"https://datacamp.com",c:"#03EF62",i:"D"},{n:"edX",u:"https://edx.org/search?q=data+science",c:"#02262B",i:"X"}],
    "Web Development":     [{n:"Udemy",u:"https://udemy.com/courses/search/?q=web+development",c:"#A435F0",i:"U"},{n:"freeCodeCamp",u:"https://freecodecamp.org",c:"#0A0A23",i:"F"},{n:"Coursera",u:"https://coursera.org/search?query=web+development",c:"#0056D2",i:"C"},{n:"The Odin Project",u:"https://theodinproject.com",c:"#EF476F",i:"O"},{n:"Frontend Masters",u:"https://frontendmasters.com",c:"#C02D28",i:"FM"}],
    "AI/ML":               [{n:"Coursera",u:"https://coursera.org/search?query=machine+learning",c:"#0056D2",i:"C"},{n:"Fast.ai",u:"https://fast.ai",c:"#00A67E",i:"F"},{n:"Udemy",u:"https://udemy.com/courses/search/?q=machine+learning",c:"#A435F0",i:"U"},{n:"DeepLearning.AI",u:"https://deeplearning.ai",c:"#0B74B8",i:"DL"},{n:"Kaggle",u:"https://kaggle.com/learn",c:"#20BEFF",i:"K"}],
    "DevOps":              [{n:"Udemy",u:"https://udemy.com/courses/search/?q=devops",c:"#A435F0",i:"U"},{n:"Coursera",u:"https://coursera.org/search?query=devops",c:"#0056D2",i:"C"},{n:"Linux Foundation",u:"https://training.linuxfoundation.org",c:"#003366",i:"LF"},{n:"A Cloud Guru",u:"https://acloudguru.com",c:"#FF6600",i:"CG"},{n:"Pluralsight",u:"https://pluralsight.com",c:"#F15B2A",i:"PS"}],
    "Cybersecurity":       [{n:"Cybrary",u:"https://cybrary.it",c:"#00ADB5",i:"CB"},{n:"TryHackMe",u:"https://tryhackme.com",c:"#212C42",i:"TH"},{n:"Udemy",u:"https://udemy.com/courses/search/?q=cybersecurity",c:"#A435F0",i:"U"},{n:"Coursera",u:"https://coursera.org/search?query=cybersecurity",c:"#0056D2",i:"C"},{n:"HackTheBox",u:"https://hackthebox.com",c:"#9FEF00",i:"HB"}],
    "Mobile Development":  [{n:"Udemy",u:"https://udemy.com/courses/search/?q=mobile+development",c:"#A435F0",i:"U"},{n:"Coursera",u:"https://coursera.org/search?query=ios+android",c:"#0056D2",i:"C"},{n:"Google Codelabs",u:"https://codelabs.developers.google.com",c:"#4285F4",i:"GL"},{n:"Apple Dev",u:"https://developer.apple.com/tutorials",c:"#555",i:"A"},{n:"raywenderlich",u:"https://kodeco.com",c:"#3DBE47",i:"R"}],
    "Cloud Computing":     [{n:"AWS Training",u:"https://aws.training",c:"#FF9900",i:"AWS"},{n:"Google Cloud",u:"https://cloudskillsboost.google",c:"#4285F4",i:"GCP"},{n:"A Cloud Guru",u:"https://acloudguru.com",c:"#FF6600",i:"CG"},{n:"Coursera",u:"https://coursera.org/search?query=cloud+computing",c:"#0056D2",i:"C"},{n:"Microsoft Learn",u:"https://learn.microsoft.com",c:"#0078D4",i:"MS"}],
    "Software Engineering":[{n:"LeetCode",u:"https://leetcode.com",c:"#FFA116",i:"LC"},{n:"Udemy",u:"https://udemy.com/courses/search/?q=software+engineering",c:"#A435F0",i:"U"},{n:"Coursera",u:"https://coursera.org/search?query=software+engineering",c:"#0056D2",i:"C"},{n:"Educative",u:"https://educative.io",c:"#FF6B6B",i:"ED"},{n:"AlgoExpert",u:"https://algoexpert.io",c:"#5A67D8",i:"AE"}],
    "UI/UX Design":        [{n:"Coursera",u:"https://coursera.org/search?query=ux+design",c:"#0056D2",i:"C"},{n:"Udemy",u:"https://udemy.com/courses/search/?q=ui+ux+design",c:"#A435F0",i:"U"},{n:"Interaction Design",u:"https://interaction-design.org",c:"#E8453C",i:"IDF"},{n:"DesignLab",u:"https://trydesignlab.com",c:"#FF595A",i:"DL"},{n:"Skillshare",u:"https://skillshare.com/browse/ux-design",c:"#00CC93",i:"SS"}],
    "Big Data Engineering":[{n:"Coursera",u:"https://coursera.org/search?query=big+data",c:"#0056D2",i:"C"},{n:"Udemy",u:"https://udemy.com/courses/search/?q=big+data",c:"#A435F0",i:"U"},{n:"Databricks",u:"https://academy.databricks.com",c:"#FF3621",i:"DB"},{n:"Confluent",u:"https://training.confluent.io",c:"#0088CC",i:"CF"},{n:"A Cloud Guru",u:"https://acloudguru.com",c:"#FF6600",i:"CG"}],
    "NLP":                 [{n:"Coursera",u:"https://coursera.org/search?query=nlp",c:"#0056D2",i:"C"},{n:"Hugging Face",u:"https://huggingface.co/learn",c:"#FFD21E",i:"HF"},{n:"Fast.ai",u:"https://fast.ai",c:"#00A67E",i:"FA"},{n:"DeepLearning.AI",u:"https://deeplearning.ai",c:"#0B74B8",i:"DL"},{n:"Udemy",u:"https://udemy.com/courses/search/?q=nlp",c:"#A435F0",i:"U"}],
    "QA & Testing":        [{n:"Udemy",u:"https://udemy.com/courses/search/?q=software+testing",c:"#A435F0",i:"U"},{n:"Coursera",u:"https://coursera.org/search?query=software+testing",c:"#0056D2",i:"C"},{n:"Test Automation U",u:"https://testautomationu.applitools.com",c:"#00C8E8",i:"TAU"},{n:"Ministry of Testing",u:"https://ministryoftesting.com",c:"#E91E63",i:"MOT"},{n:"LinkedIn Learning",u:"https://linkedin.com/learning/topics/software-testing",c:"#0A66C2",i:"LL"}],
  };
  const platforms = learningPlatforms[r.domain] || learningPlatforms["Data Science"];

  // Real SVG logos for all learning platforms and job portals
  const platformLogos = {
    // Learning platforms
    "Coursera": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><circle cx="20" cy="20" r="20" fill="#0056D2"/><path d="M20 10C14.48 10 10 14.48 10 20s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm4.5 14.5h-9v-9h9v9z" fill="white"/><rect x="16" y="16" width="8" height="8" rx="1" fill="#0056D2"/></svg>`,
    "Udemy": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#A435F0"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="18" font-weight="900" font-family="Arial">U</text></svg>`,
    "Kaggle": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#20BEFF"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="14" font-weight="900" font-family="Arial">K</text></svg>`,
    "DataCamp": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#03EF62"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#0b1e14" font-size="13" font-weight="900" font-family="Arial">DC</text></svg>`,
    "edX": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#02262B"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#02AFCE" font-size="14" font-weight="900" font-family="Arial">edX</text></svg>`,
    "freeCodeCamp": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#0A0A23"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#00C8A0" font-size="11" font-weight="900" font-family="monospace">fCC</text></svg>`,
    "The Odin Project": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#EF476F"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="18" font-weight="900" font-family="Arial">⚡</text></svg>`,
    "Frontend Masters": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#C02D28"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="900" font-family="Arial">FM</text></svg>`,
    "Fast.ai": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#00A67E"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="11" font-weight="900" font-family="Arial">fast.ai</text></svg>`,
    "DeepLearning.AI": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#0B74B8"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="900" font-family="Arial">DL.AI</text></svg>`,
    "Linux Foundation": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#003366"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="18" font-weight="900" font-family="Arial">🐧</text></svg>`,
    "A Cloud Guru": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#FF6600"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="900" font-family="Arial">ACG</text></svg>`,
    "Pluralsight": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#F15B2A"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="900" font-family="Arial">PS</text></svg>`,
    "Cybrary": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#00ADB5"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="900" font-family="Arial">CB</text></svg>`,
    "TryHackMe": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#212C42"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#88CC14" font-size="12" font-weight="900" font-family="Arial">THM</text></svg>`,
    "HackTheBox": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#111927"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#9FEF00" font-size="12" font-weight="900" font-family="Arial">HTB</text></svg>`,
    "Google Codelabs": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#4285F4"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="18" font-weight="900" font-family="Arial">G</text></svg>`,
    "Apple Dev": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#1C1C1E"/><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="18" font-family="Arial"></text></svg>`,
    "raywenderlich": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#3DBE47"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="18" font-weight="900" font-family="Arial">R</text></svg>`,
    "AWS Training": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#232F3E"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#FF9900" font-size="11" font-weight="900" font-family="Arial">AWS</text></svg>`,
    "Google Cloud": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#4285F4"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="900" font-family="Arial">GCP</text></svg>`,
    "Microsoft Learn": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#0078D4"/><rect x="8" y="8" width="11" height="11" fill="#F35325"/><rect x="21" y="8" width="11" height="11" fill="#80BA01"/><rect x="8" y="21" width="11" height="11" fill="#00ADEF"/><rect x="21" y="21" width="11" height="11" fill="#FFBA08"/></svg>`,
    "LeetCode": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#1A1A2E"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#FFA116" font-size="11" font-weight="900" font-family="Arial">LC</text></svg>`,
    "Educative": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#FF6B6B"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="900" font-family="Arial">edu</text></svg>`,
    "AlgoExpert": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#5A67D8"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="900" font-family="Arial">AE</text></svg>`,
    "Interaction Design": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#E8453C"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="11" font-weight="900" font-family="Arial">IDF</text></svg>`,
    "DesignLab": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#FF595A"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="900" font-family="Arial">DL</text></svg>`,
    "Skillshare": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#00CC93"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="900" font-family="Arial">SS</text></svg>`,
    "Databricks": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#FF3621"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="11" font-weight="900" font-family="Arial">DB</text></svg>`,
    "Confluent": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#0088CC"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="900" font-family="Arial">CF</text></svg>`,
    "Hugging Face": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#FFD21E"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#1C1C1C" font-size="18">🤗</text></svg>`,
    "Test Automation U": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#00C8E8"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="11" font-weight="900" font-family="Arial">TAU</text></svg>`,
    "Ministry of Testing": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#E91E63"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="11" font-weight="900" font-family="Arial">MoT</text></svg>`,
    "LinkedIn Learning": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#0A66C2"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="14" font-weight="900" font-family="Arial">in</text></svg>`,

    // Job search portals
    "LinkedIn": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#0A66C2"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16" font-weight="900" font-family="Arial">in</text></svg>`,
    "Indeed": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#2164F3"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="13" font-weight="900" font-family="Arial">ind</text></svg>`,
    "Glassdoor": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#0CAA41"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="14" font-weight="900" font-family="Arial">GD</text></svg>`,
    "Naukri": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#FF7555"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="11" font-weight="900" font-family="Arial">naukri</text></svg>`,
    "Internshala": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#1ABC9C"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="900" font-family="Arial">IS</text></svg>`,
    "Wellfound": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#FB651E"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="900" font-family="Arial">WF</text></svg>`,
    "Unstop": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#6C63FF"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="900" font-family="Arial">U</text></svg>`,
    "HackerEarth": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="#323754"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="900" font-family="Arial">HE</text></svg>`,
  };

  // Helper to get a logo SVG by name, fallback to colored initial
  function getLogo(name, color) {
    if (platformLogos[name]) return platformLogos[name];
    // Fallback: colored box with initials
    const initial = name.replace(/[^A-Z]/g, '').slice(0,2) || name.slice(0,2).toUpperCase();
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect width="40" height="40" rx="8" fill="${color}"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="13" font-weight="900" font-family="Arial">${initial}</text></svg>`;
  }

  // Job portals with India + global
  const jobPortals = [
    {name:"LinkedIn",   color:"#0A66C2", bg:"rgba(10,102,194,.1)",  desc:"Global · Professional network",   url:`https://linkedin.com/jobs/search/?keywords=${encodeURIComponent(r.domain)}`},
    {name:"Naukri",     color:"#FF7555", bg:"rgba(255,117,85,.1)",   desc:"India #1 job portal",             url:`https://naukri.com/jobs-in-india?k=${encodeURIComponent(r.domain)}`},
    {name:"Indeed",     color:"#2164F3", bg:"rgba(33,100,243,.1)",   desc:"Millions of listings",            url:`https://indeed.com/jobs?q=${encodeURIComponent(r.domain)}`},
    {name:"Glassdoor",  color:"#0CAA41", bg:"rgba(12,170,65,.1)",    desc:"Salaries + reviews",              url:`https://glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(r.domain)}`},
    {name:"Internshala",color:"#1ABC9C", bg:"rgba(26,188,156,.1)",   desc:"India internships",               url:`https://internshala.com/jobs/keywords-${encodeURIComponent(r.domain.toLowerCase().replace(/ /g,'-'))}`},
    {name:"Wellfound",  color:"#FB651E", bg:"rgba(251,101,30,.1)",   desc:"Startup roles",                   url:`https://wellfound.com/jobs?q=${encodeURIComponent(r.domain)}`},
    {name:"Unstop",     color:"#6C63FF", bg:"rgba(108,99,255,.1)",   desc:"India competitions + jobs",       url:`https://unstop.com/jobs?search=${encodeURIComponent(r.domain)}`},
    {name:"HackerEarth",color:"#323754", bg:"rgba(50,55,84,.1)",     desc:"Tech hiring challenges",          url:`https://hackerearth.com/jobs`},
  ];

  document.getElementById("resultsContent").innerHTML = `

    <!-- ── HEADER ── -->
    <div class="results-header">
      <div>
        <div class="tag-pills">
          <span class="tag-pill" style="background:${dc}10;border:1px solid ${dc}25;color:${dc}">${domainIcons[r.domain]||"◈"} ${r.domain}</span>
          <span class="tag-pill" style="background:${scC}10;border:1px solid ${scC}25;color:${scC}">${r.experience_level}</span>
          <span class="tag-pill" style="background:rgba(22,163,74,.1);border:1px solid rgba(22,163,74,.25);color:#16a34a">✓ AI Analyzed</span>
        </div>
        <h2 class="results-title">Resume Analysis Results</h2>
        <p class="results-meta">${r.filename} · ${new Date().toLocaleString()}</p>
      </div>
      <button class="btn-outline" onclick="showPage('upload')">+ New Analysis</button>
    </div>

    <!-- ── SCORE ROW ── -->
    <div class="score-summary-row">
      <div class="score-card">
        <div class="score-circle">
          <canvas id="scoreRadial" width="120" height="120"></canvas>
          <div class="score-number" style="color:${scC}">${r.resume_score}<span style="font-size:1rem">%</span></div>
        </div>
        <div class="score-label">MATCH SCORE</div>
        <div style="margin-top:6px;padding:4px 12px;border-radius:99px;background:${scC}15;border:1px solid ${scC}30;font-size:.72rem;font-weight:700;color:${scC}">${scLabel}</div>
        <div class="score-mini-row" style="margin-top:14px">
          <div class="score-mini-item"><div class="score-mini-val" style="color:#16a34a">${r.matched_skills.length}</div><div class="score-mini-label">Matched</div></div>
          <div class="score-mini-item"><div class="score-mini-val" style="color:#d97706">${relatedSkills.length}</div><div class="score-mini-label">Related</div></div>
          <div class="score-mini-item"><div class="score-mini-val" style="color:#dc2626">${r.missing_skills.length}</div><div class="score-mini-label">Missing</div></div>
        </div>
      </div>
      <div class="summary-col">
        <div class="card">
          <div class="section-label">Candidate Summary</div>
          <p class="summary-text">${r.summary}</p>
        </div>
        <!-- Simple 2-bar skill overview -->
        <div class="card" style="padding:18px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <div class="section-label">Skill Overview</div>
            <div style="font-size:.72rem;color:var(--text-muted)">${r.matched_skills.length + relatedSkills.length} / ${r.matched_skills.length + relatedSkills.length + r.missing_skills.length} skills covered</div>
          </div>
          <!-- Progress bar -->
          <div style="height:10px;border-radius:99px;background:var(--bg-alt);overflow:hidden;margin-bottom:10px">
            <div style="height:100%;border-radius:99px;background:linear-gradient(90deg,#16a34a,#d97706);width:${Math.round((r.matched_skills.length+relatedSkills.length*0.65)/(r.matched_skills.length+relatedSkills.length+r.missing_skills.length||1)*100)}%;transition:width .8s ease"></div>
          </div>
          <div style="display:flex;gap:16px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:5px;font-size:.72rem;color:var(--text-sub)"><span style="width:10px;height:10px;border-radius:2px;background:#16a34a;display:inline-block"></span>Matched (${r.matched_skills.length})</div>
            <div style="display:flex;align-items:center;gap:5px;font-size:.72rem;color:var(--text-sub)"><span style="width:10px;height:10px;border-radius:2px;background:#d97706;display:inline-block"></span>Related (${relatedSkills.length})</div>
            <div style="display:flex;align-items:center;gap:5px;font-size:.72rem;color:var(--text-sub)"><span style="width:10px;height:10px;border-radius:2px;background:#dc2626;display:inline-block"></span>Missing (${r.missing_skills.length})</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── SKILLS SECTION ── -->
    <div class="card" style="margin-bottom:18px">
      <div class="card-title" style="margin-bottom:16px">🎯 Skills Breakdown</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:${relatedSkills.length?'14px':'0'}">
        <!-- Matched -->
        <div style="background:rgba(22,163,74,.05);border:1px solid rgba(22,163,74,.18);border-radius:14px;padding:16px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <div style="width:28px;height:28px;border-radius:8px;background:rgba(22,163,74,.15);display:flex;align-items:center;justify-content:center;font-size:14px">✅</div>
            <div>
              <div style="font-weight:700;font-size:.82rem;color:#16a34a">Matched Skills</div>
              <div style="font-size:.65rem;color:var(--text-muted)">Found directly in your resume</div>
            </div>
            <div style="margin-left:auto;font-family:'Fraunces',serif;font-weight:700;font-size:1.3rem;color:#16a34a">${r.matched_skills.length}</div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:5px">
            ${r.matched_skills.length ? r.matched_skills.map(s=>`<span style="font-size:.72rem;padding:4px 10px;border-radius:6px;font-weight:600;background:rgba(22,163,74,.12);color:#16a34a;border:1px solid rgba(22,163,74,.25)">${s}</span>`).join("") : `<span style="font-size:.78rem;color:var(--text-muted);font-style:italic">No direct matches found</span>`}
          </div>
        </div>
        <!-- Missing -->
        <div style="background:rgba(220,38,38,.05);border:1px solid rgba(220,38,38,.18);border-radius:14px;padding:16px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <div style="width:28px;height:28px;border-radius:8px;background:rgba(220,38,38,.15);display:flex;align-items:center;justify-content:center;font-size:14px">❌</div>
            <div>
              <div style="font-weight:700;font-size:.82rem;color:#dc2626">Missing Skills</div>
              <div style="font-size:.65rem;color:var(--text-muted)">Not found — add these to improve score</div>
            </div>
            <div style="margin-left:auto;font-family:'Fraunces',serif;font-weight:700;font-size:1.3rem;color:#dc2626">${r.missing_skills.length}</div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:5px">
            ${r.missing_skills.length ? r.missing_skills.map(s=>`<span style="font-size:.72rem;padding:4px 10px;border-radius:6px;font-weight:500;background:rgba(220,38,38,.08);color:#dc2626;border:1px solid rgba(220,38,38,.2)">${s}</span>`).join("") : `<span style="font-size:.78rem;color:#16a34a;font-weight:600">🎉 No missing skills!</span>`}
          </div>
        </div>
      </div>
      <!-- Related -->
      ${relatedSkills.length ? `
      <div style="background:rgba(217,119,6,.05);border:1px solid rgba(217,119,6,.2);border-radius:14px;padding:16px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <div style="width:28px;height:28px;border-radius:8px;background:rgba(217,119,6,.15);display:flex;align-items:center;justify-content:center;font-size:14px">🔗</div>
          <div>
            <div style="font-weight:700;font-size:.82rem;color:#d97706">Related Skills <span style="font-size:.65rem;font-weight:400;opacity:.7">(${relatedSkills.length})</span></div>
            <div style="font-size:.65rem;color:var(--text-muted)">Implied by domain keywords in your resume — not counted as missing</div>
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${relatedSkills.map(rs=>`
            <span title="${rs.note||''}" style="font-size:.72rem;padding:4px 10px;border-radius:6px;font-weight:500;background:rgba(217,119,6,.1);color:#d97706;border:1px solid rgba(217,119,6,.22);cursor:help;display:inline-flex;align-items:center;gap:4px">
              🔗 ${rs.skill} <span style="font-size:.6rem;opacity:.65">${Math.round((rs.confidence||0.7)*100)}%</span>
            </span>`).join("")}
        </div>
        ${r.detected_triggers?.length ? `<div style="margin-top:10px;font-size:.65rem;color:var(--text-muted)">Detected keywords: <strong style="color:#d97706">${r.detected_triggers.slice(0,6).join(" · ")}</strong></div>` : ""}
      </div>` : ""}
    </div>

    <!-- ── JOB DESCRIPTION MATCH (only shown if user pasted a JD) ── -->
    ${r.jd_analysis ? `
    <div class="jd-match-section" style="margin-bottom:18px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:5px">
        <div class="jd-match-title">📋 Job Description Keyword Match</div>
        <div style="padding:4px 14px;border-radius:99px;font-size:.72rem;font-weight:700;
          color:${r.jd_analysis.jd_match_score>=70?'#16a34a':r.jd_analysis.jd_match_score>=40?'#d97706':'#dc2626'};
          background:${r.jd_analysis.jd_match_score>=70?'rgba(22,163,74,.12)':r.jd_analysis.jd_match_score>=40?'rgba(217,119,6,.12)':'rgba(220,38,38,.12)'};
          border:1px solid ${r.jd_analysis.jd_match_score>=70?'rgba(22,163,74,.3)':r.jd_analysis.jd_match_score>=40?'rgba(217,119,6,.3)':'rgba(220,38,38,.3)'}">
          JD Match: ${r.jd_analysis.jd_match_score}%
        </div>
      </div>
      <div class="jd-match-sub">
        Keywords extracted from the job description you pasted — compared directly against your resume.
        Found <strong>${r.jd_analysis.jd_keywords_matched.length}</strong> of <strong>${r.jd_analysis.jd_keywords_total}</strong> job keywords in your resume.
      </div>

      <!-- Score bar -->
      <div class="jd-score-bar-wrap" style="margin-bottom:16px">
        <div class="jd-score-bar-label">
          <span>Keyword Coverage</span>
          <span style="font-weight:700;color:#7c3aed">${r.jd_analysis.jd_match_score}%</span>
        </div>
        <div class="jd-score-bar-track">
          <div class="jd-score-bar-fill" style="width:${r.jd_analysis.jd_match_score}%"></div>
        </div>
      </div>

      <!-- Matched JD keywords vs missing JD keywords -->
      <div class="jd-kw-grid">
        <div class="jd-kw-card matched">
          <div class="jd-kw-label">✅ Found in Resume (${r.jd_analysis.jd_keywords_matched.length})</div>
          <div class="jd-kw-chips">
            ${r.jd_analysis.jd_keywords_matched.length
              ? r.jd_analysis.jd_keywords_matched.map(k=>`<span class="jd-kw-chip matched">${k}</span>`).join("")
              : `<span style="font-size:.75rem;color:var(--text-muted);font-style:italic">None found</span>`}
          </div>
        </div>
        <div class="jd-kw-card missing">
          <div class="jd-kw-label">❌ Missing from Resume (${r.jd_analysis.jd_keywords_missing.length})</div>
          <div class="jd-kw-chips">
            ${r.jd_analysis.jd_keywords_missing.length
              ? r.jd_analysis.jd_keywords_missing.map(k=>`<span class="jd-kw-chip missing">${k}</span>`).join("")
              : `<span style="font-size:.75rem;color:#16a34a;font-weight:600">🎉 All keywords found!</span>`}
          </div>
        </div>
      </div>

      <!-- Top keywords from JD -->
      ${r.jd_analysis.jd_top_keywords && r.jd_analysis.jd_top_keywords.length ? `
      <div style="margin-top:12px;padding:12px 14px;background:rgba(124,58,237,.04);border:1px solid rgba(124,58,237,.15);border-radius:10px">
        <div style="font-size:.65rem;color:#7c3aed;font-weight:700;letter-spacing:.8px;text-transform:uppercase;margin-bottom:8px">
          🔑 Most Important Keywords from Job Description
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${r.jd_analysis.jd_top_keywords.map(k=>`
            <span style="font-size:.72rem;padding:3px 10px;border-radius:6px;font-weight:600;
              background:${r.jd_analysis.jd_keywords_matched.includes(k)?'rgba(22,163,74,.12)':'rgba(124,58,237,.1)'};
              color:${r.jd_analysis.jd_keywords_matched.includes(k)?'#16a34a':'#7c3aed'};
              border:1px solid ${r.jd_analysis.jd_keywords_matched.includes(k)?'rgba(22,163,74,.3)':'rgba(124,58,237,.25)'}">
              ${r.jd_analysis.jd_keywords_matched.includes(k)?'✓':'○'} ${k}
            </span>`).join("")}
        </div>
      </div>` : ""}

      <div style="margin-top:12px;padding:10px 14px;background:rgba(8,145,178,.05);border:1px solid rgba(8,145,178,.15);border-radius:8px;font-size:.78rem;color:var(--text-sub)">
        💡 <strong>Tip:</strong> Add the missing JD keywords naturally into your resume's Skills section or work experience descriptions to increase your match rate with this specific job.
      </div>
    </div>` : ""}

    <!-- ── IMPROVEMENT SUGGESTIONS ── -->
    <div class="card" style="margin-bottom:18px">
      <div class="card-title" style="margin-bottom:4px">💡 How to Improve Your Resume</div>
      <div style="font-size:.75rem;color:var(--text-muted);margin-bottom:16px">Actionable steps to boost your match score</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${r.suggestions.map((s,i)=>`
          <div style="display:flex;gap:12px;padding:14px 16px;border-radius:12px;background:var(--bg-alt);border:1px solid var(--border)">
            <div style="width:26px;height:26px;border-radius:8px;flex-shrink:0;background:${["rgba(124,58,237,.12)","rgba(8,145,178,.12)","rgba(5,150,105,.12)"][i]};color:${["#7c3aed","#0891b2","#059669"][i]};display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:800;margin-top:1px">${i+1}</div>
            <div style="font-size:.84rem;color:var(--text-sub);line-height:1.65">${s}</div>
          </div>`).join("")}
        <!-- Extra tip if missing skills exist -->
        ${r.missing_skills.length > 0 ? `
        <div style="display:flex;gap:12px;padding:14px 16px;border-radius:12px;background:rgba(220,38,38,.04);border:1px solid rgba(220,38,38,.15)">
          <div style="width:26px;height:26px;border-radius:8px;flex-shrink:0;background:rgba(220,38,38,.12);color:#dc2626;display:flex;align-items:center;justify-content:center;font-size:14px;margin-top:1px">🎯</div>
          <div style="font-size:.84rem;color:var(--text-sub);line-height:1.65">Focus on learning: <strong style="color:var(--text)">${r.missing_skills.slice(0,4).join(", ")}</strong> — adding these skills can increase your score by 15–25%.</div>
        </div>` : ""}
      </div>
    </div>

    <!-- ── companiesByDomain ── -->
    <div class="card" style="margin-bottom:18px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <div style="font-family:'Fraunces',serif;font-weight:700;font-size:1rem;color:var(--text)">🏢 Companies You Qualify For</div>
      </div>
      <div style="font-size:.75rem;color:var(--text-muted);margin-bottom:18px">Based on your ${r.resume_score}% match score for ${r.domain}</div>

      ${noCompany ? `
      <!-- No company match — show improvement message -->
      <div style="border-radius:14px;background:rgba(220,38,38,.04);border:1px solid rgba(220,38,38,.15);padding:24px;text-align:center;margin-bottom:16px">
        <div style="font-size:2rem;margin-bottom:10px">📈</div>
        <div style="font-family:'Fraunces',serif;font-weight:700;font-size:1rem;color:var(--text);margin-bottom:8px">Your score needs improvement to match companies</div>
        <div style="font-size:.82rem;color:var(--text-sub);line-height:1.7;max-width:480px;margin:0 auto">
          Your current score is <strong style="color:#dc2626">${r.resume_score}%</strong>. Most ${r.domain} companies require at least <strong style="color:#d97706">${Math.min(...companies.map(c=>c.minScore))}%</strong>.
          Add the missing skills above to your resume and re-analyze to unlock company matches.
        </div>
        <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          ${r.missing_skills.slice(0,4).map(s=>`<span style="padding:5px 12px;border-radius:99px;background:rgba(220,38,38,.1);border:1px solid rgba(220,38,38,.2);font-size:.72rem;font-weight:600;color:#dc2626">+ ${s}</span>`).join("")}
        </div>
      </div>
      <!-- Still show companies they're close to -->
      ${almost.length ? `
      <div style="margin-bottom:6px;font-size:.75rem;font-weight:600;color:#d97706">⚡ Almost there — improve your score to unlock:</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px">
        ${almost.map(co=>`
        <div style="border-radius:12px;border:1px dashed rgba(217,119,6,.35);background:rgba(217,119,6,.03);padding:14px;display:flex;align-items:center;gap:12px">
          <div style="width:38px;height:38px;border-radius:10px;background:${co.color};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.9rem;color:#fff;flex-shrink:0">${co.logo}</div>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Fraunces',serif;font-weight:700;font-size:.9rem;color:var(--text)">${co.name}</div>
            <div style="font-size:.68rem;color:var(--text-muted)">${co.roles.join(" · ")}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:.68rem;color:#d97706;font-weight:600">Need ${co.minScore}%</div>
            <div style="font-size:.65rem;color:var(--text-muted)">You: ${r.resume_score}%</div>
          </div>
        </div>`).join("")}
      </div>` : ""}
      ` : `
      <!-- Qualified companies grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-bottom:${almost.length?'16px':'0'}">
        ${qualified.map(co=>`
        <div class="company-card">
          <div class="company-top">
            <div class="company-logo" style="background:${co.color}">${co.logo}</div>
            <div>
              <div class="company-name">${co.name}</div>
              <div class="company-roles">${co.roles.join(" · ")}</div>
            </div>
            <div class="company-match">
              <div class="company-match-val" style="color:${scC}">${Math.min(98,Math.round(r.resume_score*0.92+5))}%</div>
              <div class="company-match-label">match</div>
            </div>
          </div>
          <div class="company-links">
            <a href="${co.linkedin}" target="_blank" class="co-link" style="background:rgba(10,102,194,.1);border-color:rgba(10,102,194,.2);color:#0A66C2"><span style="font-weight:900;font-size:10px">in</span> LinkedIn</a>
            <a href="${co.indeed}"   target="_blank" class="co-link" style="background:rgba(0,58,155,.08);border-color:rgba(0,58,155,.15);color:#003A9B">Indeed</a>
            <a href="${co.site}"     target="_blank" class="co-link" style="background:var(--bg-alt);border-color:var(--border);color:var(--text-sub)">Careers ↗</a>
          </div>
        </div>`).join("")}
      </div>
      ${almost.length ? `
      <div class="almost-box">
        <div class="almost-label">⚡ Almost there — boost your score to unlock:</div>
        <div class="almost-chips">
          ${almost.map(co=>`
          <div class="almost-chip">
            <div class="almost-logo" style="background:${co.color}">${co.logo}</div>
            <div><div class="almost-name">${co.name}</div><div class="almost-need">Need ${co.minScore}% · You: ${r.resume_score}%</div></div>
          </div>`).join("")}
        </div>
      </div>` : ""}
      `}
    </div>

    <!-- ── learningPlatforms PLATFORMS ── -->
    <div class="card" style="margin-bottom:18px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <div style="font-family:'Fraunces',serif;font-weight:700;font-size:1rem;color:var(--text)">🎓 Learn & Upskill — ${r.domain}</div>
      </div>
      <div style="font-size:.75rem;color:var(--text-muted);margin-bottom:16px">Top platforms to learn missing skills and boost your profile</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:10px">
        ${platforms.map(p=>`
        <a href="${p.u}" target="_blank" style="display:flex;align-items:center;gap:11px;padding:13px 14px;border-radius:12px;border:1px solid var(--border);background:var(--surface);text-decoration:none;transition:all .25s;box-shadow:var(--shadow)" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='var(--shadow-hover)'" onmouseout="this.style.transform='';this.style.boxShadow='var(--shadow)'">
          <div style="width:38px;height:38px;border-radius:9px;background:${p.c}15;border:1px solid ${p.c}30;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden">${getLogo(p.n, p.c)}</div>
          <div>
            <div style="font-family:'Fraunces',serif;font-weight:600;font-size:.88rem;color:var(--text)">${p.n}</div>
            <div style="font-size:.65rem;color:var(--text-muted);margin-top:1px">Free &amp; paid courses</div>
          </div>
          <span style="margin-left:auto;font-size:.7rem;color:var(--text-muted)">↗</span>
        </a>`).join("")}
      </div>
      ${noCompany ? `
      <div style="margin-top:14px;padding:13px 16px;border-radius:11px;background:rgba(124,58,237,.06);border:1px solid rgba(124,58,237,.18);font-size:.8rem;color:var(--text-sub);line-height:1.65">
        💡 <strong style="color:var(--text)">Pro tip:</strong> Complete at least 1 course for each missing skill and add it to your resume. Even a certificate project on GitHub can significantly improve your ATS score.
      </div>` : ""}
    </div>

    <!-- ── JOB SEARCH PORTALS ── -->
    <div class="card" style="margin-bottom:18px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <div style="font-family:'Fraunces',serif;font-weight:700;font-size:1rem;color:var(--text)">🔍 Apply for Jobs — ${r.domain}</div>
      </div>
      <div style="font-size:.75rem;color:var(--text-muted);margin-bottom:16px">Search pre-filtered ${r.domain} roles on top job portals (India + Global)</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
        ${jobPortals.map(p=>`
        <a href="${p.url}" target="_blank" style="display:flex;align-items:center;gap:12px;padding:13px 15px;border-radius:12px;border:1px solid var(--border);background:var(--surface);text-decoration:none;transition:all .25s;box-shadow:var(--shadow)" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='var(--shadow-hover)'" onmouseout="this.style.transform='';this.style.boxShadow='var(--shadow)'">
          <div style="width:38px;height:38px;border-radius:9px;background:${p.bg};border:1px solid ${p.color}25;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden">${getLogo(p.name, p.color)}</div>
          <div style="min-width:0">
            <div style="font-family:'Fraunces',serif;font-weight:600;font-size:.9rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div>
            <div style="font-size:.65rem;color:var(--text-muted);margin-top:1px">${p.desc}</div>
          </div>
          <span style="margin-left:auto;font-size:.7rem;color:var(--text-muted);flex-shrink:0">↗</span>
        </a>`).join("")}
      </div>
      <!-- LinkedIn Open to Work banner -->
      <div style="margin-top:14px;padding:14px 18px;border-radius:12px;background:rgba(10,102,194,.06);border:1px solid rgba(10,102,194,.18);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:40px;height:40px;border-radius:9px;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center">${getLogo("LinkedIn","#0A66C2")}</div>
          <div>
            <div style="font-family:'Fraunces',serif;font-weight:600;color:var(--text);font-size:.9rem">Enable "Open to Work" on LinkedIn</div>
            <div style="font-size:.72rem;color:var(--text-muted)">Get found by ${r.domain} recruiters actively hiring</div>
          </div>
        </div>
        <a href="https://linkedin.com/jobs/search/?keywords=${encodeURIComponent(r.domain)}" target="_blank" style="padding:9px 20px;border-radius:9px;background:#0A66C2;color:#fff;font-family:'Instrument Sans',sans-serif;font-weight:600;font-size:.82rem;text-decoration:none;flex-shrink:0;transition:opacity .2s" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">Search ${r.domain} Jobs →</a>
      </div>
    </div>
  `;

  // Draw only the score radial (simple, clean)
  setTimeout(() => drawScoreRadial(r.resume_score, scC), 50);
}

// Score Radial (only chart kept)
function drawScoreRadial(score, color) {
  const canvas = document.getElementById("scoreRadial");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const cx = 60, cy = 60, r = 46, lw = 11;
  ctx.clearRect(0, 0, 120, 120);
  // Track ring
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.07)";
  ctx.lineWidth = lw; ctx.stroke();
  // Score arc
  if (score > 0) {
    const angle = (score / 100) * Math.PI * 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + angle);
    ctx.strokeStyle = color; ctx.lineWidth = lw;
    ctx.lineCap = "round"; ctx.stroke();
  }
}

function rebuildCharts(r) {
  if (!r) return;
  const scC = r.resume_score >= 70 ? "#16a34a" : r.resume_score >= 40 ? "#d97706" : "#dc2626";
  drawScoreRadial(r.resume_score, scC);
}
// History
function renderHistory() {
  const list = document.getElementById("historyList");
  if (!history.length) {
    list.innerHTML = `<div class="empty-state">No analyses yet. <a onclick="showPage('upload')">Start now →</a></div>`;
    return;
  }
  list.innerHTML = history.map((r, i) => {
    const dc  = domainColors[r.domain] || "#7c3aed";
    const scC = r.resume_score >= 70 ? "#16a34a" : r.resume_score >= 40 ? "#d97706" : "#dc2626";
    return `
      <div class="history-item" onclick="loadHistory(${i})">
        <div class="history-bar" style="background:linear-gradient(180deg,${dc},transparent)"></div>
        <div class="history-left">
          <div class="history-domain-icon" style="background:${dc}12;border:1px solid ${dc}20;color:${dc}">${domainIcons[r.domain]}</div>
          <div>
            <div class="history-filename">${r.filename}</div>
            <div class="history-meta">${r.domain} · ${new Date().toLocaleString()}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:14px">
          <div style="text-align:right">
            <div class="history-score" style="color:${scC}">${r.resume_score}%</div>
            <div class="history-level">${r.experience_level}</div>
          </div>
          <span style="color:var(--text-muted)">→</span>
        </div>
      </div>`;
  }).join("");
}

function loadHistory(i) {
  currentResults = history[i];
  renderResults(history[i]);
  showPage("results");
}

// Chatbot
function toggleChat() {
  chatOpen = !chatOpen;
  document.getElementById("chatPanel").classList.toggle("hidden", !chatOpen);
  document.getElementById("coachToggle").classList.toggle("active", chatOpen);
  if (chatOpen && !chatMinimized) document.getElementById("chatInput").focus();
}

function closeChat() {
  chatOpen = false;
  document.getElementById("chatPanel").classList.add("hidden");
  document.getElementById("coachToggle").classList.remove("active");
}

function minimizeChat() {
  chatMinimized = !chatMinimized;
  document.getElementById("chatBody").style.display = chatMinimized ? "none" : "";
  document.getElementById("chatChips").style.display = chatMinimized ? "none" : "";
  document.getElementById("minBtn").textContent = chatMinimized ? "↑" : "↓";
}

function updateChips() {
  const chips = currentResults
    ? ["What's my score?", "Missing skills?", "Which companies?", "How does RF work?"]
    : ["How does RF work?", "Resume writing tips", "What is TF-IDF?", "Career advice"];
  document.getElementById("chatChips").innerHTML = chips.map(q =>
    `<button class="chip-btn" onclick="sendChat('${q}')">${q}</button>`
  ).join("");
}

function botReply(msg) {
  const m = msg.toLowerCase();
  const r = currentResults;
  const sc = r?.resume_score, domain = r?.domain;
  const missing = r?.missing_skills || [], matched = r?.matched_skills || [];

  if (/score|percentage|result|how.*(did|am)|rating/.test(m)) {
    if (!sc) return "Upload and analyze your resume first to see your RF model score!";
    const tier = sc >= 70 ? "strong" : sc >= 40 ? "moderate" : "low";
    return `Your RF model score is **${sc}%** — a ${tier} match for **${domain}**.\n\n${sc < 70 ? `Focus on adding: ${missing.slice(0,3).join(", ")}.` : "Great profile! Target senior or lead roles."}`;
  }
  if (/missing|improve|gap|add|need|learn|train|skill|related/.test(m)) {
    if (!matched.length && !missing.length) return "Run an analysis first and I'll pinpoint your skill gaps!";
    const relNames = r?.related_skill_names || [];
    let reply = "";
    if (missing.length) {
      reply += `Your **truly missing** skills for **${domain}** are:\n\n${missing.slice(0,4).map(s=>`• **${s}** — learn it on Coursera or build a project`).join("\n")}\n\n`;
    }
    if (relNames.length) {
      reply += `**Related skills** (implied by your domain keywords):\n${relNames.slice(0,4).map(s=>`• ${s}`).join("\n")}\n\nThese were inferred from your resume — list them explicitly to boost your ATS score!`;
    }
    return reply || "Your resume looks complete for the selected domain!";
  }
  if (/matched|have|already|strength|good at/.test(m)) {
    if (!matched.length) return "Analyze your resume to see which skills you already have!";
    return `You already have **${matched.length} matching skills** for ${domain}:\n\n${matched.slice(0,6).map(s=>`• ${s}`).join("\n")}\n\nThese are your competitive strengths.`;
  }
  if (/compan|job|hire|apply|where|work/.test(m)) {
    if (!sc) return "Analyze your resume first and I'll show which companies you qualify for!";
    return `With a score of **${sc}%**, you ${sc>=55?"qualify":"need a higher score"} for most ${domain} companies.\n\n• LinkedIn → search "${domain}" jobs\n• Indeed → set alerts for ${domain} roles\n• Glassdoor → check salary ranges`;
  }
  if (/algorithm|how.*work|ml|tfidf|cosine|forest|random|feature|train|model/.test(m)) {
    const metrics = r?.model_metrics;
    return `The ML pipeline has **5 stages**:\n\n• **Dataset** — 600 labeled resume samples\n• **TF-IDF** — corpus-calibrated term vectors\n• **Feature Engineering** — 8 features extracted\n• **Random Forest** — 100 trees, max depth 8\n• **5-Fold CV** — MAE: ${metrics?.cv_mae||"~4.2"} pts · R²: ${metrics?.cv_r2||"~0.96"}\n\nFlask backend serves the trained sklearn model.`;
  }
  if (/tip|advice|write|format|cv|resume|template/.test(m)) {
    return `**ML-optimized resume tips:**\n\n• Use exact skill keywords (e.g. "TensorFlow" not "deep learning framework")\n• Add a skills section with comma-separated technologies\n• Quantify achievements: "improved accuracy by 15%"\n• Keep to 1–2 pages with consistent formatting\n• Mirror language from the job description verbatim`;
  }
  if (/salary|pay|earn|compensation|money/.test(m)) {
    const salaries = {"Data Science":"$95K–$140K","Web Development":"$85K–$130K","AI/ML":"$120K–$175K","DevOps":"$100K–$145K"};
    const s = domain ? (salaries[domain] || "$90K–$145K") : "$90K–$145K";
    return `Typical salary for **${domain||"tech"} roles**: **${s}**\n\nCheck Glassdoor and Levels.fyi for real-time data.`;
  }
  if (/hi|hello|hey|good|morning|evening/.test(m)) {
    return `Hello! I'm your **ML Career Coach**.\n\nAsk me about:\n• Your RF model score\n• Missing skills\n• Which companies to apply to\n• How the Random Forest works\n• Resume writing tips`;
  }
  return `I can answer questions about:\n\n• **Your ML score** — "What's my score?"\n• **Skill gaps** — "What skills am I missing?"\n• **Companies** — "Which companies can I apply to?"\n• **Algorithms** — "How does the RF work?"\n• **Tips** — "How to improve my resume?"`;
}

function sendChat(txt) {
  const input = document.getElementById("chatInput");
  const msg = txt || input.value.trim();
  if (!msg) return;
  input.value = "";

  const body = document.getElementById("chatBody");

  // User bubble
  body.innerHTML += `
    <div class="chat-msg user">
      <div class="msg-bubble">${msg}</div>
      <div class="user-avatar">You</div>
    </div>`;

  // Typing indicator
  const typingId = "typing_" + Date.now();
  body.innerHTML += `
    <div class="chat-msg bot" id="${typingId}">
      <div class="msg-avatar">ML</div>
      <div class="msg-bubble"><div class="typing"><span></span><span></span><span></span></div></div>
    </div>`;
  body.scrollTop = body.scrollHeight;

  setTimeout(() => {
    document.getElementById(typingId)?.remove();
    const reply = botReply(msg);
    const html  = reply
      .split("\n")
      .map(line => {
        if (!line.trim()) return "<div style='height:5px'></div>";
        const formatted = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        if (/^[•\-]\s/.test(line)) return `<div style="padding-left:14px;position:relative;margin-top:2px"><span style="position:absolute;left:0;color:var(--accent)">·</span>${formatted.replace(/^[•\-]\s/,"")}</div>`;
        return `<div>${formatted}</div>`;
      }).join("");
    body.innerHTML += `
      <div class="chat-msg bot">
        <div class="msg-avatar">ML</div>
        <div class="msg-bubble">${html}</div>
      </div>`;
    body.scrollTop = body.scrollHeight;
    updateChips();
  }, 600);
}
