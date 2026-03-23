# generate_dataset.py
# -------------------
# Run this script first before training the model.
# It creates resume_dataset.csv with 600 fake resume samples.
#
# Usage:  python generate_dataset.py

import pandas as pd
import numpy as np
import random
import os

random.seed(42)
np.random.seed(42)


# skills for each job domain
domain_skills = {
    "Data Science": [
        "Python", "R", "SQL", "Pandas", "NumPy", "Matplotlib",
        "Scikit-learn", "TensorFlow", "Tableau", "Power BI",
        "Statistics", "Machine Learning", "Data Visualization", "Excel", "Spark"
    ],
    "Web Development": [
        "HTML", "CSS", "JavaScript", "React", "Node.js", "Express",
        "MongoDB", "TypeScript", "REST API", "Git", "Docker",
        "Tailwind CSS", "Vue.js", "GraphQL", "Next.js"
    ],
    "AI/ML": [
        "Python", "TensorFlow", "PyTorch", "Scikit-learn", "NLP",
        "Computer Vision", "Deep Learning", "Keras", "OpenCV",
        "Transformers", "BERT", "LangChain", "MLflow", "Hugging Face", "CUDA"
    ],
    "DevOps": [
        "Docker", "Kubernetes", "CI/CD", "Jenkins", "AWS", "Azure",
        "GCP", "Terraform", "Ansible", "Linux", "Shell Scripting",
        "Git", "Prometheus", "Grafana", "Nginx"
    ],
    "Cybersecurity": [
        "Network Security", "Penetration Testing", "SIEM", "Firewalls",
        "Cryptography", "Ethical Hacking", "Kali Linux", "Wireshark",
        "Python", "Risk Assessment", "SOC", "OWASP",
        "Metasploit", "Incident Response", "Compliance"
    ],
    "Mobile Development": [
        "Swift", "Kotlin", "React Native", "Flutter", "iOS", "Android",
        "Dart", "Firebase", "REST API", "Git", "Xcode",
        "Android Studio", "SQLite", "UI/UX", "Push Notifications"
    ],
    "Cloud Computing": [
        "AWS", "Azure", "GCP", "Terraform", "Kubernetes", "Docker",
        "Serverless", "Lambda", "S3", "IAM", "CloudFormation",
        "CDN", "Load Balancing", "VPC", "Cost Optimization"
    ],
    "Software Engineering": [
        "Java", "C++", "Python", "Design Patterns", "OOP",
        "Data Structures", "Algorithms", "Git", "Agile", "Scrum",
        "Unit Testing", "REST API", "Microservices", "SOLID Principles", "System Design"
    ],
    "UI/UX Design": [
        "Figma", "Adobe XD", "Wireframing", "Prototyping", "User Research",
        "Usability Testing", "Design Systems", "HTML", "CSS", "Accessibility",
        "Information Architecture", "Color Theory", "Typography", "Zeplin", "Motion Design"
    ],
    "Big Data Engineering": [
        "Apache Spark", "Hadoop", "Kafka", "Hive", "Flink", "Airflow",
        "Python", "Scala", "Data Pipelines", "ETL", "Data Lake",
        "Databricks", "Snowflake", "Data Warehousing", "dbt"
    ],
    "NLP": [
        "Python", "NLTK", "spaCy", "Transformers", "BERT", "GPT",
        "Tokenization", "Text Classification", "NER", "Sentiment Analysis",
        "Word2Vec", "LangChain", "Hugging Face", "RAG", "Fine-tuning"
    ],
    "QA & Testing": [
        "Manual Testing", "Selenium", "Cypress", "Jest", "JUnit",
        "TestNG", "API Testing", "Postman", "Performance Testing",
        "JMeter", "Test Planning", "Bug Tracking", "JIRA", "Automation", "BDD/TDD"
    ]
}


# settings per experience level
# min skills, max skills, bonus score, min final score, max final score, number of samples
experience_config = {
    "Entry-Level": {
        "min_skills":  1,
        "max_skills":  5,
        "bonus":       0.30,
        "score_min":   10,
        "score_max":   45,
        "num_samples": 15
    },
    "Mid-Level": {
        "min_skills":  5,
        "max_skills":  10,
        "bonus":       0.60,
        "score_min":   40,
        "score_max":   75,
        "num_samples": 20
    },
    "Senior": {
        "min_skills":  9,
        "max_skills":  15,
        "bonus":       0.90,
        "score_min":   65,
        "score_max":   97,
        "num_samples": 15
    }
}


# words that typically show up in resumes at each level
seniority_words = {
    "Senior":      ["senior", "lead", "principal", "architect", "director", "10+ years", "head of"],
    "Mid-Level":   ["engineer", "developer", "specialist", "3+ years", "4+ years", "5+ years"],
    "Entry-Level": ["junior", "intern", "entry level", "fresher", "graduate", "0-1 years", "trainee"]
}


# short resume description templates
resume_templates = {
    "Senior": [
        "Senior {domain} professional with 8+ years of experience. Led multiple high-impact projects.",
        "Principal {domain} engineer with deep expertise and strong leadership background.",
        "Experienced {domain} architect with 10+ years delivering enterprise-scale solutions."
    ],
    "Mid-Level": [
        "{domain} engineer with 4+ years of hands-on experience in building production systems.",
        "Mid-level {domain} developer with 3+ years working on real-world projects.",
        "Experienced {domain} specialist with 5 years of industry experience."
    ],
    "Entry-Level": [
        "Recent graduate with a degree in Computer Science, passionate about {domain}.",
        "Junior {domain} developer eager to learn and grow in a fast-paced environment.",
        "Entry-level {domain} intern with foundational knowledge and strong academic background."
    ]
}


def make_resume_text(domain, experience, matched_skills):
    """Build a short fake resume description for one sample."""
    template    = random.choice(resume_templates[experience]).format(domain=domain)
    skills_part = ", ".join(matched_skills[:6])
    keyword     = random.choice(seniority_words[experience])
    return template + " Skills include: " + skills_part + ". Background includes " + keyword + " roles."


def compute_features(matched_skills, all_skills, bonus):
    """
    Calculate the 8 features used by the Random Forest model.
    These must match exactly what train_model.py expects.
    """
    num_matched = len(matched_skills)
    num_total   = len(all_skills)

    # fraction of required skills this person has
    match_ratio = num_matched / max(1, num_total)

    # cosine similarity - approximated from match ratio + noise
    cosine_sim = match_ratio * np.random.uniform(0.65, 0.95)

    # how many skills per 100 words (approx)
    word_count    = max(50, np.random.randint(80, 300))
    skill_density = min(1.0, (num_matched / word_count) * 100)

    # keyword overlap
    keyword_overlap = match_ratio * np.random.uniform(0.70, 1.00)

    # seniority signal - seniors score high, juniors score low
    if bonus >= 0.9:
        seniority_signal = np.random.uniform(0.5, 1.0)
    elif bonus >= 0.6:
        seniority_signal = np.random.uniform(0.2, 0.6)
    else:
        seniority_signal = np.random.uniform(0.0, 0.3)

    # average domain term frequency
    domain_term_freq = match_ratio * np.random.uniform(0.55, 0.90)

    # do they have the most important skills (top half of the list)?
    top_half         = all_skills[: len(all_skills) // 2 + 1]
    top_half_matched = [s for s in matched_skills if s in top_half]
    skill_depth      = len(top_half_matched) / max(1, len(top_half))

    return {
        "match_ratio":      round(match_ratio,      4),
        "cosine_sim":       round(cosine_sim,        4),
        "skill_density":    round(skill_density,     4),
        "exp_bonus":        round(bonus,             2),
        "keyword_overlap":  round(keyword_overlap,   4),
        "seniority_signal": round(seniority_signal,  4),
        "domain_term_freq": round(domain_term_freq,  4),
        "skill_depth":      round(skill_depth,       4)
    }


def compute_score(features, min_score, max_score):
    """
    Calculate the ground truth score (0-100) for a sample.
    This is what the model learns to predict.
    match_ratio gets the most weight (45%), then cosine similarity (20%), etc.
    """
    raw = (
        0.45 * features["match_ratio"]
      + 0.20 * features["cosine_sim"]
      + 0.15 * features["exp_bonus"]
      + 0.10 * features["skill_depth"]
      + 0.05 * features["keyword_overlap"]
      + 0.05 * features["seniority_signal"]
    )
    noise = np.random.normal(0, 0.03)
    return int(np.clip(round((raw + noise) * 100), min_score, max_score))


def build_dataset():
    """
    Loop through all domains and experience levels and generate samples.
    Returns a list of dicts — one per resume sample.
    """
    rows      = []
    sample_id = 1

    for domain, skills_list in domain_skills.items():
        total = len(skills_list)

        for experience, config in experience_config.items():
            for _ in range(config["num_samples"]):
                num_skills    = np.random.randint(config["min_skills"], min(config["max_skills"], total) + 1)
                person_has    = list(np.random.choice(skills_list, size=num_skills, replace=False))
                person_missing = [s for s in skills_list if s not in person_has]
                resume_text   = make_resume_text(domain, experience, person_has)
                features      = compute_features(person_has, skills_list, config["bonus"])
                score         = compute_score(features, config["score_min"], config["score_max"])

                rows.append({
                    "sample_id":        sample_id,
                    "domain":           domain,
                    "experience_level": experience,
                    "resume_text":      resume_text,
                    "matched_skills":   " | ".join(person_has),
                    "missing_skills":   " | ".join(person_missing),
                    "n_matched":        num_skills,
                    "n_total_skills":   total,
                    "match_ratio":      features["match_ratio"],
                    "cosine_sim":       features["cosine_sim"],
                    "skill_density":    features["skill_density"],
                    "exp_bonus":        features["exp_bonus"],
                    "keyword_overlap":  features["keyword_overlap"],
                    "seniority_signal": features["seniority_signal"],
                    "domain_term_freq": features["domain_term_freq"],
                    "skill_depth":      features["skill_depth"],
                    "score":            score
                })
                sample_id += 1

    return rows


if __name__ == "__main__":
    print("Generating dataset...")

    rows   = build_dataset()
    df     = pd.DataFrame(rows)
    output = os.path.join(os.path.dirname(__file__), "resume_dataset.csv")
    df.to_csv(output, index=False)

    print("Done! Saved to: " + output)
    print("Total samples:  " + str(len(df)))
    print("Domains:        " + str(df["domain"].nunique()))
    print("Score range:    " + str(df["score"].min()) + " to " + str(df["score"].max()))
    print("")

    summary = df.groupby("experience_level")["score"].agg(["count","min","mean","max"])
    summary.columns = ["Count", "Min", "Avg", "Max"]
    summary["Avg"] = summary["Avg"].round(1)
    print("Breakdown by experience level:")
    print(summary.to_string())
    print("")
    print("Next step: run  python train_model.py")
