# app.py
# This is the main backend for the ResumeML project.
# It handles everything: serving pages, analyzing resumes,
# login/register, and returning results to the frontend.
#
# Start the server with:  python app.py
# Then open:              http://127.0.0.1:5000

import os
import re
import json
import math
import sqlite3
import hashlib
import secrets
import uuid
import random
import traceback
from datetime import datetime

import numpy as np
import joblib
from flask import Flask, request, jsonify, send_from_directory, session, redirect
from werkzeug.utils import secure_filename



# paths


# app.py is at the project root — same level as static/, templates/, dataset/, model/
project_root  = os.path.dirname(os.path.abspath(__file__))
model_file    = os.path.join(project_root, "model", "resume_rf_model.pkl")
metadata_file = os.path.join(project_root, "model", "model_metadata.json")
frontend_dir  = project_root
uploads_dir   = os.path.join(project_root, "uploads")

# SQLite database file for user accounts.
# On Render (Linux) we use /tmp which is always writable.
# On Windows (local development) we use the dataset/ folder.
if os.environ.get("RENDER"):
    users_db = "/tmp/resumeml_users.db"
else:
    # Works on Windows, Mac, and Linux
    users_db = os.path.join(project_root, "dataset", "users.db")

os.makedirs(uploads_dir, exist_ok=True)



# flask setup


app = Flask(
    __name__,
    static_folder=os.path.join(frontend_dir, "static"),
    template_folder=os.path.join(frontend_dir, "templates")
)

app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024

# Use a fixed secret key from environment variable on Render
# Falls back to a random key locally (fine for development)
app.secret_key = os.environ.get("SECRET_KEY", secrets.token_hex(32))



# load the trained model


try:
    rf_model  = joblib.load(model_file)
    with open(metadata_file) as f:
        model_info = json.load(f)
    domain_skills  = model_info["domain_skills"]
    feature_names  = model_info["features"]
    model_is_ready = True
    print("Model loaded  MAE=" + str(model_info["cv_mae_mean"]) + "  R2=" + str(model_info["cv_r2_mean"]))
except Exception as err:
    model_is_ready = False
    model_info = {}
    print("Could not load model: " + str(err))
    print("Run dataset/train_model.py first.")
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
    feature_names = [
        "match_ratio", "cosine_sim", "skill_density", "exp_bonus",
        "keyword_overlap", "seniority_signal", "domain_term_freq", "skill_depth"
    ]



# skill aliases
# People write skills in many different ways. This maps them all to one name.


skill_aliases = {
    "node.js":          ["nodejs", "node js", "node"],
    "react":            ["reactjs", "react.js", "react js"],
    "vue.js":           ["vuejs", "vue js", "vue"],
    "next.js":          ["nextjs", "next js"],
    "express":          ["expressjs", "express.js"],
    "mongodb":          ["mongo db", "mongo"],
    "rest api":         ["restful api", "rest apis", "restful", "rest", "api development", "web api", "restful services"],
    "scikit-learn":     ["sklearn", "scikit learn"],
    "tensorflow":       ["tf", "tensor flow"],
    "pytorch":          ["torch"],
    "pandas":           ["pd"],
    "numpy":            ["np"],
    "matplotlib":       ["plt"],
    "apache spark":     ["pyspark", "spark"],
    "power bi":         ["powerbi", "power-bi"],
    "aws":              ["amazon web services", "amazon aws"],
    "gcp":              ["google cloud platform", "google cloud", "google cloud services"],
    "azure":            ["microsoft azure", "azure cloud"],
    "kubernetes":       ["k8s"],
    "docker":           ["docker container", "containerization", "dockerfile"],
    "ci/cd":            ["cicd", "ci cd", "continuous integration", "continuous deployment",
                         "continuous delivery", "github actions", "gitlab ci", "jenkins pipeline", "circle ci"],
    "sql":              ["mysql", "postgresql", "mssql", "sql server", "sqlite",
                         "database", "structured query language", "relational database", "postgres"],
    "nosql":            ["mongodb", "cassandra", "dynamodb", "redis", "couchdb"],
    "machine learning": ["ml algorithms", "ml models", "predictive modeling",
                         "supervised learning", "unsupervised learning", "classification", "regression", "ml"],
    "deep learning":    ["neural networks", "neural network", "ann", "cnn", "rnn", "lstm", "dl"],
    "natural language processing": ["nlp", "text processing", "text mining", "language model"],
    "computer vision":  ["image processing", "image recognition", "object detection", "cv"],
    "transformers":     ["hugging face transformers", "attention mechanism"],
    "bert":             ["bert model", "roberta", "distilbert", "albert"],
    "langchain":        ["lang chain", "llm framework"],
    "mlflow":           ["ml flow", "ml ops", "mlops"],
    "shell scripting":  ["bash", "bash scripting", "shell script", "bash script", "zsh", "sh"],
    "linux":            ["ubuntu", "centos", "debian", "unix", "linux server"],
    "penetration testing": ["pentest", "pen test", "pentesting"],
    "kali linux":       ["kali"],
    "owasp":            ["owasp top 10"],
    "siem":             ["security information and event management"],
    "bdd/tdd":          ["bdd", "tdd", "behavior driven development", "test driven development"],
    "oop":              ["object oriented programming", "object-oriented programming", "object oriented", "oops"],
    "design patterns":  ["design pattern", "gof patterns"],
    "data structures":  ["data structure", "arrays", "linked lists", "trees", "graphs", "heaps"],
    "algorithms":       ["algorithm", "sorting algorithms", "searching algorithms", "dynamic programming"],
    "agile":            ["agile methodology", "agile development", "agile scrum"],
    "scrum":            ["scrum master", "sprint", "scrum methodology"],
    "microservices":    ["microservice", "micro services", "service oriented architecture", "soa"],
    "solid principles": ["solid", "single responsibility", "dependency injection", "solid design"],
    "system design":    ["system architecture", "low level design", "high level design", "lld", "hld"],
    "git":              ["github", "gitlab", "bitbucket", "version control", "git workflow"],
    "react native":     ["rn", "react-native"],
    "flutter":          ["flutter sdk", "flutter dart"],
    "firebase":         ["google firebase", "firebase sdk"],
    "figma":            ["figma design"],
    "adobe xd":         ["adobexd", "xd"],
    "wireframing":      ["wireframe", "wireframes"],
    "prototyping":      ["prototype", "prototypes"],
    "user research":    ["ux research", "user interviews"],
    "usability testing":["user testing", "ux testing"],
    "etl":              ["extract transform load", "data pipeline", "data pipelines"],
    "data warehousing": ["data warehouse", "data warehouses"],
    "graphql":          ["graph ql"],
    "typescript":       ["ts"],
    "unit testing":     ["unit test", "unit tests", "test coverage"],
    "tailwind css":     ["tailwind", "tailwindcss"],
    "jira":             ["jira board", "atlassian jira"],
}

# build a reverse lookup so we can find canonical names quickly
alias_lookup = {}
for standard, variations in skill_aliases.items():
    alias_lookup[standard] = standard
    for v in variations:
        alias_lookup[v.lower()] = standard



# skill relationships
# When someone mentions "machine learning" we can infer they probably also
# know pandas, numpy etc. even if not explicitly listed.
# confidence >= 0.5 means we count it as a "related" skill


skill_relationships = {
    # data science
    "machine learning":    [("pandas",0.9),
        ("numpy",0.9),
        ("scikit-learn",0.9),
        ("matplotlib",0.8),
        ("python",0.95),
        ("statistics",0.8),
        ("data visualization",0.7),
        ("sql",0.7)],
    "data science":        [("pandas",0.95),
        ("numpy",0.95),
        ("matplotlib",0.9),
        ("sql",0.85),
        ("statistics",0.9),
        ("python",0.95),
        ("data visualization",0.85),
        ("scikit-learn",0.8),
        ("r",0.6),
        ("excel",0.7)],
    "deep learning":       [("tensorflow",0.9),("pytorch",0.85),("keras",0.85),("numpy",0.9),("python",0.95),("cuda",0.7)],
    "data analysis":       [("excel",0.9),
        ("pandas",0.9),
        ("power bi",0.8),
        ("tableau",0.75),
        ("matplotlib",0.8),
        ("sql",0.9),
        ("statistics",0.85),
        ("numpy",0.8),
        ("python",0.75)],
    "data engineering":    [("apache spark",0.9),
        ("kafka",0.85),
        ("airflow",0.85),
        ("etl",0.95),
        ("data pipelines",0.95),
        ("hadoop",0.7),
        ("sql",0.9),
        ("python",0.9),
        ("scala",0.7),
        ("databricks",0.7),
        ("data lake",0.8),
        ("data warehousing",0.8)],
    "data visualization":  [("matplotlib",0.9),("tableau",0.85),("power bi",0.85),("excel",0.8),("python",0.7)],
    "statistical analysis":[("statistics",0.95),("r",0.85),("pandas",0.8),("numpy",0.8),("excel",0.75),("python",0.7)],
    "business intelligence":[("power bi",0.9),("tableau",0.9),("excel",0.9),("sql",0.85),("data visualization",0.9)],
    # ai and ml
    "artificial intelligence":[("python",0.95),
        ("machine learning",0.9),
        ("tensorflow",0.8),
        ("deep learning",0.8),
        ("scikit-learn",0.75),
        ("numpy",0.85),
        ("pandas",0.8)],
    "natural language processing":[("nltk",0.9),
        ("spacy",0.9),
        ("transformers",0.85),
        ("bert",0.8),
        ("python",0.95),
        ("word2vec",0.75),
        ("text classification",0.85),
        ("tokenization",0.85),
        ("hugging face",0.8),
        ("ner",0.75),
        ("sentiment analysis",0.75)],
    "nlp":                 [("nltk",0.9),
        ("spacy",0.9),
        ("transformers",0.85),
        ("bert",0.8),
        ("python",0.95),
        ("hugging face",0.8),
        ("text classification",0.8),
        ("tokenization",0.8),
        ("word2vec",0.7),
        ("ner",0.7),
        ("sentiment analysis",0.7)],
    "computer vision":     [("opencv",0.9),("tensorflow",0.85),("pytorch",0.85),("numpy",0.9),("python",0.95),("keras",0.75)],
    "reinforcement learning":[("tensorflow",0.8),("pytorch",0.8),("numpy",0.9),("python",0.95)],
    "mlops":               [("mlflow",0.9),("docker",0.85),("kubernetes",0.8),("python",0.9),("ci/cd",0.75),("git",0.85),("aws",0.7)],
    "generative ai":       [("python",0.95),
        ("langchain",0.85),
        ("transformers",0.85),
        ("hugging face",0.85),
        ("bert",0.7),
        ("fine-tuning",0.8),
        ("rag",0.75)],
    "llm":                 [("python",0.95),("langchain",0.85),("hugging face",0.85),("transformers",0.85),("fine-tuning",0.8),("rag",0.8)],
    # web development
    "web development":     [("html",0.95),
        ("css",0.95),
        ("javascript",0.95),
        ("rest api",0.85),
        ("git",0.9),
        ("sql",0.75),
        ("react",0.7),
        ("node.js",0.7)],
    "frontend development":[("html",0.98),
        ("css",0.98),
        ("javascript",0.98),
        ("react",0.85),
        ("typescript",0.75),
        ("tailwind css",0.7),
        ("git",0.9),
        ("rest api",0.8),
        ("next.js",0.65),
        ("vue.js",0.6)],
    "backend development": [("rest api",0.95),
        ("sql",0.9),
        ("python",0.85),
        ("node.js",0.8),
        ("docker",0.75),
        ("git",0.9),
        ("mongodb",0.7),
        ("express",0.7)],
    "full stack development":[("html",0.95),
        ("css",0.95),
        ("javascript",0.95),
        ("react",0.85),
        ("node.js",0.85),
        ("express",0.8),
        ("mongodb",0.8),
        ("sql",0.8),
        ("rest api",0.9),
        ("git",0.9),
        ("docker",0.7),
        ("typescript",0.7)],
    "javascript":          [("html",0.95),("css",0.9),("react",0.75),("node.js",0.7),("typescript",0.65),("git",0.85),("rest api",0.7)],
    "react":               [("javascript",0.98),
        ("html",0.9),
        ("css",0.9),
        ("typescript",0.75),
        ("rest api",0.85),
        ("git",0.9),
        ("node.js",0.7),
        ("next.js",0.6)],
    "node.js":             [("javascript",0.98),("express",0.9),("mongodb",0.75),("rest api",0.9),("git",0.85)],
    "next.js":             [("react",0.95),("javascript",0.98),("typescript",0.8),("css",0.85),("rest api",0.8),("git",0.85)],
    "vue.js":              [("javascript",0.98),("html",0.9),("css",0.9),("typescript",0.7),("rest api",0.8),("git",0.85)],
    "api development":     [("rest api",0.95),("graphql",0.7),("node.js",0.75),("python",0.75),("postman",0.8)],
    # mobile
    "mobile development":  [("rest api",0.9),
        ("git",0.9),
        ("firebase",0.75),
        ("swift",0.6),
        ("kotlin",0.6),
        ("react native",0.65),
        ("flutter",0.65)],
    "ios development":     [("swift",0.98),("xcode",0.95),("rest api",0.85),("git",0.9),("firebase",0.7)],
    "android development": [("kotlin",0.98),("android studio",0.95),("java",0.8),("rest api",0.85),("git",0.9),("firebase",0.7)],
    "flutter":             [("dart",0.98),("firebase",0.85),("rest api",0.85),("git",0.9),("android studio",0.7),("xcode",0.65)],
    "react native":        [("javascript",0.98),("typescript",0.75),("firebase",0.8),("rest api",0.9),("git",0.9)],
    # cloud
    "cloud computing":     [("aws",0.8),
        ("azure",0.7),
        ("gcp",0.7),
        ("docker",0.85),
        ("kubernetes",0.75),
        ("terraform",0.7),
        ("linux",0.8),
        ("git",0.85)],
    "aws":                 [("s3",0.9),
        ("lambda",0.85),
        ("iam",0.9),
        ("cloudformation",0.75),
        ("vpc",0.8),
        ("terraform",0.7),
        ("linux",0.75),
        ("docker",0.7)],
    "azure":               [("kubernetes",0.75),("terraform",0.7),("linux",0.75),("docker",0.75)],
    "gcp":                 [("terraform",0.7),("kubernetes",0.8),("linux",0.75),("docker",0.75)],
    "serverless":          [("lambda",0.9),("aws",0.8),("s3",0.7),("terraform",0.65)],
    "infrastructure as code":[("terraform",0.95),("ansible",0.85),("cloudformation",0.75),("docker",0.75),("linux",0.8)],
    # devops
    "devops":              [("docker",0.95),
        ("kubernetes",0.9),
        ("ci/cd",0.95),
        ("linux",0.9),
        ("git",0.95),
        ("aws",0.75),
        ("terraform",0.8),
        ("ansible",0.75),
        ("shell scripting",0.85),
        ("jenkins",0.75),
        ("prometheus",0.7),
        ("grafana",0.7),
        ("nginx",0.65)],
    "docker":              [("kubernetes",0.75),("linux",0.85),("ci/cd",0.75),("git",0.85),("shell scripting",0.7)],
    "kubernetes":          [("docker",0.9),("linux",0.85),("terraform",0.7),("ci/cd",0.75),("git",0.85)],
    "ci/cd":               [("git",0.95),("docker",0.85),("jenkins",0.75),("kubernetes",0.7),("shell scripting",0.75),("linux",0.8)],
    "containerization":    [("docker",0.98),("kubernetes",0.9),("linux",0.85),("ci/cd",0.8),("shell scripting",0.7)],
    "site reliability engineering":[("linux",0.9),
        ("kubernetes",0.9),
        ("prometheus",0.9),
        ("grafana",0.85),
        ("docker",0.85),
        ("ci/cd",0.8),
        ("shell scripting",0.85),
        ("python",0.75),
        ("terraform",0.75)],
    "sre":                 [("linux",0.9),
        ("kubernetes",0.9),
        ("prometheus",0.9),
        ("grafana",0.85),
        ("docker",0.85),
        ("ci/cd",0.8),
        ("shell scripting",0.85)],
    # cybersecurity
    "cybersecurity":       [("network security",0.9),
        ("penetration testing",0.85),
        ("firewalls",0.85),
        ("cryptography",0.8),
        ("owasp",0.85),
        ("kali linux",0.75),
        ("wireshark",0.75),
        ("soc",0.75),
        ("siem",0.75),
        ("risk assessment",0.8),
        ("incident response",0.8),
        ("compliance",0.75)],
    "penetration testing": [("kali linux",0.95),
        ("metasploit",0.9),
        ("wireshark",0.85),
        ("owasp",0.9),
        ("python",0.8),
        ("network security",0.9),
        ("ethical hacking",0.9)],
    "ethical hacking":     [("kali linux",0.95),
        ("metasploit",0.9),
        ("wireshark",0.85),
        ("python",0.8),
        ("owasp",0.85),
        ("network security",0.9),
        ("penetration testing",0.9)],
    "network security":    [("firewalls",0.9),("wireshark",0.85),("siem",0.8),("owasp",0.75)],
    "security operations": [("soc",0.95),("siem",0.9),("incident response",0.9),("network security",0.85),("firewalls",0.8)],
    # software engineering
    "software engineering":[("design patterns",0.9),
        ("oop",0.95),
        ("data structures",0.9),
        ("algorithms",0.9),
        ("git",0.95),
        ("agile",0.85),
        ("scrum",0.8),
        ("unit testing",0.85),
        ("rest api",0.85),
        ("microservices",0.75),
        ("solid principles",0.8),
        ("system design",0.75)],
    "software development":[("git",0.95),("oop",0.9),("unit testing",0.85),("agile",0.8),("rest api",0.8),("design patterns",0.75)],
    "object oriented programming":[("design patterns",0.9),("oop",0.98),("solid principles",0.8)],
    "oop":                 [("design patterns",0.9),("solid principles",0.8),("unit testing",0.7)],
    "algorithms":          [("data structures",0.95),("python",0.7),("java",0.7),("c++",0.65)],
    "data structures":     [("algorithms",0.95),("oop",0.75)],
    "agile":               [("scrum",0.85),("jira",0.8),("git",0.85),("unit testing",0.7),("ci/cd",0.65)],
    "scrum":               [("agile",0.9),("jira",0.85),("git",0.8)],
    "system design":       [("microservices",0.85),("rest api",0.85),("docker",0.75),("kubernetes",0.7),("sql",0.75)],
    "microservices":       [("docker",0.9),("kubernetes",0.8),("rest api",0.9),("kafka",0.7),("git",0.85)],
    # databases
    "database":            [("sql",0.95),("mongodb",0.75),("redis",0.65)],
    "nosql":               [("mongodb",0.9),("redis",0.75),("cassandra",0.7),("firebase",0.65)],
    "data warehousing":    [("snowflake",0.9),("databricks",0.85),("etl",0.9),("dbt",0.8),("sql",0.9),("data pipelines",0.85)],
    # ui ux
    "ui/ux design":        [("figma",0.95),
        ("wireframing",0.95),
        ("prototyping",0.95),
        ("user research",0.9),
        ("usability testing",0.85),
        ("design systems",0.8),
        ("html",0.75),
        ("css",0.75),
        ("accessibility",0.8),
        ("information architecture",0.8),
        ("typography",0.75),
        ("color theory",0.75)],
    "ui design":           [("figma",0.95),
        ("adobe xd",0.85),
        ("wireframing",0.9),
        ("design systems",0.85),
        ("typography",0.8),
        ("color theory",0.8),
        ("css",0.75),
        ("html",0.7)],
    "ux design":           [("user research",0.95),
        ("usability testing",0.9),
        ("wireframing",0.9),
        ("prototyping",0.85),
        ("information architecture",0.85),
        ("figma",0.9),
        ("accessibility",0.8)],
    "product design":      [("figma",0.95),
        ("wireframing",0.9),
        ("prototyping",0.9),
        ("user research",0.85),
        ("design systems",0.85),
        ("usability testing",0.8),
        ("accessibility",0.75)],
    "figma":               [("wireframing",0.9),("prototyping",0.9),("design systems",0.8),("typography",0.75),("color theory",0.7)],
    # big data
    "big data":            [("apache spark",0.95),
        ("hadoop",0.85),
        ("kafka",0.85),
        ("hive",0.8),
        ("airflow",0.8),
        ("scala",0.75),
        ("python",0.9),
        ("etl",0.9),
        ("data lake",0.85),
        ("databricks",0.75),
        ("data pipelines",0.9)],
    "apache spark":        [("hadoop",0.8),
        ("scala",0.8),
        ("python",0.85),
        ("data lake",0.75),
        ("databricks",0.75),
        ("kafka",0.7),
        ("hive",0.7),
        ("etl",0.85)],
    "kafka":               [("apache spark",0.75),("data pipelines",0.9),("etl",0.8),("python",0.8)],
    "airflow":             [("data pipelines",0.95),("etl",0.9),("python",0.9),("apache spark",0.7),("sql",0.75)],
    # qa
    "qa":                  [("manual testing",0.9),
        ("selenium",0.85),
        ("api testing",0.85),
        ("postman",0.85),
        ("jira",0.85),
        ("test planning",0.9),
        ("bug tracking",0.9),
        ("automation",0.75)],
    "qa & testing": [
        ("manual testing",0.9), ("selenium",0.85), ("cypress",0.75),
        ("jest",0.7), ("junit",0.7), ("testng",0.7), ("api testing",0.85),
        ("postman",0.85), ("performance testing",0.75), ("jmeter",0.7),
        ("test planning",0.9), ("bug tracking",0.9), ("jira",0.85),
        ("automation",0.8), ("bdd/tdd",0.7)
    ],
    "test automation":     [("selenium",0.9),
        ("cypress",0.85),
        ("jest",0.8),
        ("junit",0.8),
        ("testng",0.75),
        ("python",0.75),
        ("java",0.75),
        ("bdd/tdd",0.8),
        ("git",0.85)],
    "software testing":    [("manual testing",0.9),
        ("selenium",0.8),
        ("api testing",0.85),
        ("postman",0.85),
        ("jmeter",0.7),
        ("test planning",0.9),
        ("jira",0.8)],
    # languages
    "python":              [("pandas",0.85),("numpy",0.85),("matplotlib",0.8),("flask",0.7),("scikit-learn",0.7),("git",0.9)],
    "java":                [("oop",0.95),("design patterns",0.85),("junit",0.8),("git",0.9)],
    "c++":                 [("oop",0.95),("data structures",0.9),("algorithms",0.9),("git",0.85)],
    "scala":               [("apache spark",0.9),("java",0.8),("git",0.85)],
    "typescript":          [("javascript",0.98),("react",0.75),("node.js",0.7),("git",0.85)],
    "kotlin":              [("android development",0.9),("android studio",0.9),("oop",0.85),("git",0.85)],
    "swift":               [("ios development",0.9),("xcode",0.95),("oop",0.85),("git",0.85)],
    "dart":                [("flutter",0.98),("firebase",0.8),("rest api",0.8),("git",0.85)],
    # tooling
    "git":                 [("version control",0.98)],
    "linux":               [("shell scripting",0.9),("bash",0.9)],
}


# short abbreviations people use in resumes
abbrev_map = {
    "ml":  "machine learning",
    "dl":  "deep learning",
    "nlp": "natural language processing",
    "cv":  "computer vision",
    "js":  "javascript",
    "ts":  "typescript",
    "k8s": "kubernetes",
    "py":  "python",
    "tf":  "tensorflow",
    "aws": "amazon web services",
    "gcp": "google cloud platform",
    "rl":  "reinforcement learning",
    "oop": "object oriented programming",
    "qa":  "quality assurance",
    "ci":  "continuous integration",
    "cd":  "continuous deployment",
    "iac": "infrastructure as code",
    "sre": "site reliability engineering",
    "llm": "large language model",
    "ai":  "artificial intelligence",
}

# words we ignore when building tfidf vectors
stop_words = {
    "a","an","the","and","or","but","in","on","at","to","for","of","with","by",
    "from","is","was","are","were","be","been","have","has","had","do","does","did",
    "will","would","could","should","may","might","i","me","my","we","our","you",
    "your","he","she","it","they","them","their","this","that","which","who","what",
    "as","if","then","than","so","just","also","more","most","other","some","up",
    "experience","years","year","work","working","worked","team","using","used",
    "knowledge","skills","skill","proficient","excellent","seeking","passionate",
    "developed","building","built","designed","led","managed","created","implemented",
}



# text processing helpers


def expand_abbrevs(text):
    """Replace short abbreviations with full forms so matching works better."""
    lower = text.lower()
    for short, full in abbrev_map.items():
        lower = re.sub(r'\b' + re.escape(short) + r'\b', full, lower)
    return lower


def tokenize(text):
    """Split text into clean lowercase tokens, removing punctuation and stop words."""
    cleaned = re.sub(r"[^a-z0-9#+.\s/]", " ", text.lower())
    return [w for w in cleaned.split() if len(w) > 1 and w not in stop_words]


def build_tf(tokens):
    """Term frequency — how often each word appears relative to total words."""
    counts = {}
    for t in tokens:
        counts[t] = counts.get(t, 0) + 1
    total = len(tokens) or 1
    return {k: v / total for k, v in counts.items()}


def build_idf(corpus):
    """Inverse document frequency — rare words get higher weight."""
    doc_freq = {}
    n = len(corpus)
    for doc in corpus:
        for t in set(tokenize(doc)):
            doc_freq[t] = doc_freq.get(t, 0) + 1
    return {t: math.log((n + 1) / (df + 1)) + 1 for t, df in doc_freq.items()}


def build_tfidf(tf, idf):
    """Multiply tf * idf for each term."""
    return {t: tf[t] * idf.get(t, math.log(2)) for t in tf}


def cosine_similarity(vec_a, vec_b):
    """
    Cosine similarity between two tfidf vectors.
    Returns a value between 0 and 1.
    """
    all_keys = set(vec_a) | set(vec_b)
    dot = sum(vec_a.get(k, 0) * vec_b.get(k, 0) for k in all_keys)
    mag_a = math.sqrt(sum(v ** 2 for v in vec_a.values()))
    mag_b = math.sqrt(sum(v ** 2 for v in vec_b.values()))
    if mag_a * mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)



# skill matching


def skill_found_in_text(skill, text_lower, text_expanded):
    """
    Check if a skill appears in the resume text.
    Tries the standard name, all known aliases, and multi-word matches.
    Short skills like "R" use word boundaries to avoid false positives.
    """
    canonical = alias_lookup.get(skill, skill)
    candidates = {skill, canonical}

    if canonical in skill_aliases:
        for a in skill_aliases[canonical]:
            candidates.add(a.lower())

    for standard, aliases in skill_aliases.items():
        if skill in [a.lower() for a in aliases]:
            candidates.add(standard)
            for a in aliases:
                candidates.add(a.lower())

    for cand in candidates:
        if len(cand) <= 2:
            pat = r'\b' + re.escape(cand) + r'\b'
            if re.search(pat, text_lower) or re.search(pat, text_expanded):
                return True
        else:
            if cand in text_lower or cand in text_expanded:
                return True
            parts = cand.split()
            if len(parts) > 1 and all(p in text_lower for p in parts):
                return True

    return False


def classify_resume_skills(resume_text, required_skills):
    """
    Goes through every required skill and puts it into one of three buckets:
      matched  - found directly in the resume
      related  - implied by a domain keyword found in the resume
      missing  - not found at all
    """
    if not resume_text:
        return [], [], list(required_skills), set()

    text_lower = resume_text.lower()
    text_expanded = expand_abbrevs(resume_text)

    # find all domain keywords mentioned in the resume
    found_triggers = {}
    for trigger in skill_relationships:
        pat = r'\b' + re.escape(trigger) + r'\b'
        if re.search(pat, text_expanded) or re.search(pat, text_lower):
            found_triggers[trigger] = True
    for short, full in abbrev_map.items():
        if re.search(r'\b' + re.escape(short) + r'\b', text_lower):
            if full in skill_relationships:
                found_triggers[full] = True

    # build a map of implied skills from the triggers we found
    implied = {}
    for trigger in found_triggers:
        for (skill, conf) in skill_relationships[trigger]:
            canonical = alias_lookup.get(skill.lower(), skill.lower())
            bucket = implied.setdefault(canonical, {})
            bucket[trigger] = max(bucket.get(trigger, 0), conf)

    # now classify each required skill
    matched = []
    related = []
    missing = []
    min_conf = 0.5

    for skill in required_skills:
        s_lower = skill.lower().strip()
        s_canonical = alias_lookup.get(s_lower, s_lower)

        if skill_found_in_text(s_lower, text_lower, text_expanded):
            matched.append(skill)
            continue

        best = implied.get(s_canonical) or implied.get(s_lower)
        if best:
            top_conf = max(best.values())
            if top_conf >= min_conf:
                triggers_ranked = sorted(best.keys(), key=lambda t: best[t], reverse=True)
                related.append({
                    "skill":       skill,
                    "confidence":  round(top_conf, 2),
                    "implied_by":  triggers_ranked,
                    "top_trigger": triggers_ranked[0],
                    "note": (
                        "Implied by '" + triggers_ranked[0] + "' found in resume "
                        "(confidence: " + str(int(top_conf * 100)) + "%)"
                        + (" and " + str(len(triggers_ranked) - 1) + " more" if len(triggers_ranked) > 1 else "")
                    ),
                })
                continue

        missing.append(skill)

    return matched, related, missing, set(found_triggers.keys())


def compute_match_ratio(matched, related, all_skills):
    """
    Matched skills count fully, related skills count at 65%.
    This gives a weighted fraction of how many required skills are covered.
    """
    weighted = len(matched) + 0.65 * len(related)
    return min(1.0, weighted / max(1, len(all_skills)))



# feature engineering


def extract_features(resume_text, domain, skills_for_domain):
    """
    Compute the 8 features the ML model was trained on.
    These must match exactly what was used in train_model.py.
    """
    corpus = [" ".join(skills) for skills in domain_skills.values()]
    idf = build_idf(corpus)
    resume_tokens = tokenize(resume_text or "no content")
    domain_tokens = tokenize(" ".join(skills_for_domain))
    resume_vec = build_tfidf(build_tf(resume_tokens), idf)
    domain_vec = build_tfidf(build_tf(domain_tokens), idf)
    cosine = cosine_similarity(resume_vec, domain_vec)

    matched, related, missing, triggers = classify_resume_skills(resume_text, skills_for_domain)
    related_names = [r["skill"] for r in related]

    match_ratio = compute_match_ratio(matched, related_names, skills_for_domain)
    skill_density = min(1.0, len(matched) / max(1, len(resume_tokens)) * 100)
    _, exp_bonus  = detect_experience_level(resume_text)

    domain_word_set  = set(domain_tokens)
    resume_word_set  = set(resume_tokens)
    keyword_overlap  = len(domain_word_set & resume_word_set) / max(1, len(domain_word_set))

    seniority_words = [
        "senior", "lead", "principal", "staff", "architect",
        "director", "vp", "manager", "head", "specialist",
        "junior", "intern", "entry", "fresher"
    ]
    seniority_count  = sum(1 for w in seniority_words if w in (resume_text or "").lower())
    seniority_signal = min(1.0, seniority_count / 3)

    domain_weights = [resume_vec.get(t, 0) for t in domain_tokens]
    domain_term_freq = sum(domain_weights) / max(1, len(domain_weights))

    top_half = skills_for_domain[: len(skills_for_domain) // 2 + 1]
    tl = (resume_text or "").lower()
    te = expand_abbrevs(resume_text or "")
    skill_depth = sum(1 for s in top_half if skill_found_in_text(s.lower(), tl, te)) / max(1, len(top_half))

    features = [match_ratio, cosine, skill_density, exp_bonus, keyword_overlap, seniority_signal, domain_term_freq, skill_depth]
    return features, matched, related, missing, cosine, triggers


def detect_experience_level(text):
    """Try to figure out if someone is junior, mid-level, or senior from their resume."""
    lower = (text or "").lower()

    senior_signals = ["senior","lead","principal","staff","architect","director","vp","chief","10+","8+ years","9+ years"]
    mid_signals = ["mid","3+ years","4+ years","5+ years","specialist","engineer ii"]
    junior_signals = ["junior","intern","entry","fresher","graduate","new grad","0-1","associate"]

    senior_count = sum(1 for w in senior_signals if w in lower)
    mid_count = sum(1 for w in mid_signals    if w in lower)
    junior_count = sum(1 for w in junior_signals if w in lower)
    year_count = len(re.findall(r"\b(19|20)\d{2}\b", text or ""))

    if senior_count > 0 or year_count >= 4:
        return "Senior",      0.90
    if mid_count    > 0 or year_count >= 2:
        return "Mid-Level",   0.65
    if junior_count > 0:
        return "Entry-Level", 0.35
    return "Mid-Level", 0.55



# text extraction from uploaded files


def read_resume_file(filepath, filename):
    """Read text from a .txt, .pdf, or .docx resume file."""
    ext = filename.rsplit(".", 1)[-1].lower()

    if ext == "txt":
        with open(filepath, "r", errors="ignore") as f:
            return f.read()

    if ext == "pdf":
        try:
            import pdfplumber
            with pdfplumber.open(filepath) as pdf:
                return "\n".join(page.extract_text() or "" for page in pdf.pages)
        except Exception:
            pass
        try:
            import PyPDF2
            with open(filepath, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                return "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception:
            pass

    if ext == "docx":
        try:
            import docx
            doc = docx.Document(filepath)
            return "\n".join(p.text for p in doc.paragraphs)
        except Exception:
            pass

    return ""



# suggestions and summary


skill_tips = {
    "Python":     "Complete a Python course on Coursera (Python for Everybody is great for beginners).",
    "TensorFlow": "Build 2-3 small TensorFlow projects and put them on GitHub.",
    "Docker":     "Containerise one of your existing projects using Docker and add it to your portfolio.",
    "AWS":        "The AWS Cloud Practitioner certification is beginner-friendly and widely recognised.",
    "React":      "Build a small CRUD app with React and deploy it on Vercel.",
    "SQL":        "Practice SQL on LeetCode and add a data analysis project to GitHub.",
    "Kubernetes": "The CKAD exam is the most practical Kubernetes certification available.",
    "PyTorch":    "Start with the official PyTorch 60-Minute Blitz tutorial.",
    "Figma":      "Design a real app mockup in Figma and post it to Dribbble.",
    "Kafka":      "Build a simple Kafka producer/consumer pipeline and document how it works.",
    "TypeScript": "Convert one of your existing JavaScript projects to TypeScript step by step.",
    "Terraform":  "Provision some cloud infra with Terraform and share your repo publicly.",
    "BERT":       "Fine-tune a BERT model on Hugging Face — their docs are really good.",
    "Selenium":   "Write a full end-to-end test suite for any public website.",
}


def build_suggestions(missing_skills, related_skills, score):
    """Return up to 3 actionable improvement tips for the candidate."""
    tips = []

    for skill in missing_skills[:2]:
        if skill in skill_tips:
            tips.append(skill_tips[skill])
        else:
            tips.append("Learn " + skill + " through hands-on projects and add measurable results to your resume.")

    if not missing_skills and related_skills:
        names = ", ".join(r["skill"] for r in related_skills[:3])
        tips.append(
            "Your resume implies you know " + names + ". "
            "Try listing them explicitly in a Skills section so ATS systems can find them."
        )

    if score < 40:
        tips.append("Add a dedicated Skills section with exact keywords from the job description.")
    elif score < 65:
        tips.append("Quantify your impact (e.g. 'improved model accuracy by 15%') and tailor your resume per role.")
    else:
        tips.append("Strong profile! Certifications or open-source contributions could push your score above 80%.")

    return tips[:3]


def build_summary(domain, experience, matched_skills, related_skills, score):
    """Write a short one-sentence summary of the candidate."""
    top = ", ".join(matched_skills[:3]) if matched_skills else "various technologies"
    num_related = len(related_skills)

    if score >= 70:
        strength = "strong"
    elif score >= 45:
        strength = "developing"
    else:
        strength = "foundational"

    implied_note = ""
    if num_related > 0:
        implied_note = " " + str(num_related) + " related skill(s) were inferred from domain keywords."

    options = [
        experience + " " + domain + " professional with " + strength + " expertise in " + top + "." + implied_note,
        "A " + strength + " " + experience + " candidate in " + domain + ", showing proficiency in " + top + "." + implied_note,
        experience + " professional targeting " + domain + " roles. Core competencies: " + top + "." + implied_note,
    ]
    return options[int(score / 34) % len(options)]



# job description keyword analysis


jd_stop_words = {
    "a","an","the","and","or","but","in","on","at","to","for","of","with","by",
    "from","is","was","are","were","be","been","have","has","had","will","would",
    "could","should","may","might","we","our","you","your","they","their","this",
    "that","which","who","what","as","if","then","than","so","just","also","more",
    "most","other","some","up","all","any","can","do","not","no","its","it","he",
    "she","me","us","am","how","why","when","where","both","each","few","into",
    "through","during","before","after","above","below","between","such","being",
    "having","including","using","based","related","strong","good","great","well",
    "new","high","required","preferred","plus","equivalent","ability","work",
    "working","experience","years","year","minimum","least","must","need","needs",
    "responsible","responsibilities","requirements","qualification","qualifications",
    "position","role","team","company","join","seeking","looking","candidate",
    "candidates","ideal","excellent","knowledge","understanding","background",
    "demonstrated","proven","hands","across","within","ensure","help","develop",
    "support","manage","build","create","design","implement","make","use","used",
}


def analyze_job_description(jd_text, resume_text):
    """
    Extract keywords from a pasted job description and check which ones
    appear in the resume. Same idea as Jobscan / ResyMatch.
    """
    if not jd_text or not jd_text.strip():
        return None

    jd_lower = jd_text.lower()
    resume_lower = resume_text.lower()

    # check all known tech skills against the JD
    all_skills_flat = [s for skills in domain_skills.values() for s in skills]
    jd_tech_keywords = [s for s in all_skills_flat if s.lower() in jd_lower]

    # also check aliases
    for canonical, aliases in skill_aliases.items():
        if canonical.replace("-", " ") in jd_lower:
            display = next((s for skills in domain_skills.values() for s in skills if s.lower() == canonical), canonical.title())
            if display not in jd_tech_keywords:
                jd_tech_keywords.append(display)
        for alias in aliases:
            if alias.lower() in jd_lower:
                display = next((s for skills in domain_skills.values() for s in skills if s.lower() == canonical), canonical.title())
                if display not in jd_tech_keywords:
                    jd_tech_keywords.append(display)

    # extract other important single words from the JD
    jd_words = re.findall(r'\b[a-zA-Z][a-zA-Z0-9\+\#\.]{2,}\b', jd_text)
    extra_words = []
    seen = set()
    for word in jd_words:
        w = word.lower()
        if w not in jd_stop_words and len(w) >= 3 and w not in seen:
            seen.add(w)
            extra_words.append(word)

    # combine and deduplicate
    seen_lower = set()
    all_keywords = []
    for kw in jd_tech_keywords:
        if kw.lower() not in seen_lower:
            seen_lower.add(kw.lower())
            all_keywords.append(kw)
    for word in extra_words:
        if word.lower() not in seen_lower:
            seen_lower.add(word.lower())
            all_keywords.append(word)

    all_keywords = all_keywords[:40]
    if not all_keywords:
        return None

    # check which ones appear in the resume
    matched_kw = []
    missing_kw = []
    for keyword in all_keywords:
        kw_lower = keyword.lower()
        if kw_lower in resume_lower:
            matched_kw.append(keyword)
            continue
        canonical = alias_lookup.get(kw_lower, kw_lower)
        found = False
        if canonical in resume_lower:
            matched_kw.append(keyword)
            found = True
        if not found and canonical in skill_aliases:
            for alias in skill_aliases[canonical]:
                if alias.lower() in resume_lower:
                    matched_kw.append(keyword)
                    found = True
                    break
        if not found:
            missing_kw.append(keyword)

    jd_score = int(round(len(matched_kw) / max(1, len(all_keywords)) * 100))
    top_kw = [k for k in all_keywords if k in jd_tech_keywords][:10]
    if len(top_kw) < 10:
        rest = [k for k in all_keywords if k not in top_kw]
        top_kw += rest[: 10 - len(top_kw)]

    return {
        "jd_match_score":      jd_score,
        "jd_keywords_total":   len(all_keywords),
        "jd_keywords_matched": matched_kw,
        "jd_keywords_missing": missing_kw,
        "jd_top_keywords":     top_kw,
    }



# cors


def add_cors(response):
    response.headers["Access-Control-Allow-Origin"]  = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

@app.after_request
def after_request(response):
    return add_cors(response)



# user database (SQLite3)
# Much better than CSV — faster, safer, and works properly on Render.
# SQLite3 is built into Python so no extra packages needed.


def get_db():
    """Open a connection to the SQLite database."""
    conn = sqlite3.connect(users_db)
    conn.row_factory = sqlite3.Row  # lets us access columns by name like a dict
    return conn


def init_db():
    """Create the users table if it doesn't exist yet."""
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id       TEXT PRIMARY KEY,
            username      TEXT UNIQUE NOT NULL,
            email         TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at    TEXT NOT NULL,
            last_login    TEXT DEFAULT ""
        )
    """)
    conn.commit()
    conn.close()


# Create the table when the app starts
init_db()


def hash_password(password):
    """Hash a password with SHA-256 before storing. Never store plain text."""
    salted = "resumeml_salt_2025_" + password
    return hashlib.sha256(salted.encode()).hexdigest()


def find_user(identifier):
    """Look up a user by username or email. Returns a dict or None."""
    search = identifier.strip().lower()
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?",
        (search, search)
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def username_taken(username):
    """Check if a username already exists."""
    conn = get_db()
    row = conn.execute(
        "SELECT 1 FROM users WHERE LOWER(username) = ?",
        (username.strip().lower(),)
    ).fetchone()
    conn.close()
    return row is not None


def email_registered(email):
    """Check if an email is already registered."""
    conn = get_db()
    row = conn.execute(
        "SELECT 1 FROM users WHERE LOWER(email) = ?",
        (email.strip().lower(),)
    ).fetchone()
    conn.close()
    return row is not None


def create_user(user_id, username, email, password_hash, created_at):
    """Insert a new user into the database."""
    conn = get_db()
    conn.execute(
        "INSERT INTO users (user_id, username, email, password_hash, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, username, email, password_hash, created_at, "")
    )
    conn.commit()
    conn.close()


def update_last_login(user_id):
    """Stamp the last login time after a user signs in."""
    conn = get_db()
    conn.execute(
        "UPDATE users SET last_login = ? WHERE user_id = ?",
        (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), user_id)
    )
    conn.commit()
    conn.close()


def update_password(user_id, new_hash):
    """Save a new password hash for a user."""
    conn = get_db()
    conn.execute(
        "UPDATE users SET password_hash = ? WHERE user_id = ?",
        (new_hash, user_id)
    )
    conn.commit()
    conn.close()


def load_all_users():
    """Return all users as a list of dicts (for the admin endpoint)."""
    conn = get_db()
    rows = conn.execute("SELECT * FROM users ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]



# auth routes


@app.route("/login")
def login_page():
    if session.get("user"):
        return redirect("/")
    return send_from_directory(os.path.join(frontend_dir, "templates"), "auth.html")


@app.route("/register")
def register_page():
    return redirect("/login")


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")


@app.route("/api/auth/register", methods=["POST"])
def register_user():
    data = request.get_json(force=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email")    or "").strip()
    password = (data.get("password") or "").strip()

    if not username or not email or not password:
        return jsonify({"success": False, "error": "All fields are required."}), 400
    if len(username) < 3:
        return jsonify({"success": False, "error": "Username must be at least 3 characters."}), 400
    if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email):
        return jsonify({"success": False, "error": "Please enter a valid email address."}), 400
    if len(password) < 6:
        return jsonify({"success": False, "error": "Password must be at least 6 characters."}), 400
    if username_taken(username):
        return jsonify({"success": False, "error": "That username is already taken."}), 409
    if email_registered(email):
        return jsonify({"success": False, "error": "An account with that email already exists."}), 409

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    create_user(
        user_id = str(uuid.uuid4())[:8],
        username = username,
        email = email,
        password_hash = hash_password(password),
        created_at = now
    )

    print("New user registered: " + username + " at " + now)
    return jsonify({"success": True, "message": "Welcome, " + username + "! Your account has been created."})


@app.route("/api/auth/login", methods=["POST"])
def login_user():
    data = request.get_json(force=True) or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    remember = bool(data.get("remember", False))

    if not username or not password:
        return jsonify({"success": False, "error": "Please enter your username and password."}), 400

    user = find_user(username)
    if not user:
        return jsonify({"success": False, "error": "No account found with that username."}), 401
    if user["password_hash"] != hash_password(password):
        return jsonify({"success": False, "error": "Incorrect password. Please try again."}), 401

    session["user"]     = user["user_id"]
    session["username"] = user["username"]
    session.permanent   = remember
    update_last_login(user["user_id"])

    print("User logged in: " + user["username"])
    return jsonify({"success": True, "username": user["username"], "user_id": user["user_id"]})


@app.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():
    """
    Reset a user's password.
    The user gives us their email, we check it exists,
    generate a simple temporary password, hash and save it,
    then return the temp password so they can log in.
    (In a real app you'd email this — here we just return it directly.)
    """
    data  = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        return jsonify({"success": False, "error": "Please enter your email address."}), 400

    user = find_user(email)
    if not user:
        return jsonify({"success": False, "error": "No account found with that email address."}), 404

    # generate a readable temporary password like "Sky7#Fox2"
    words = ["Sky", "Fox", "Oak", "Gem", "Arc", "Bay", "Ray", "Ivy", "Rio", "Sol"]
    digits  = str(random.randint(10, 99))
    special = random.choice(["#", "@", "!", "*"])
    word1 = random.choice(words)
    word2 = random.choice(words)
    temp_password = word1 + digits + special + word2

    # save the new hashed password to the database
    update_password(user["user_id"], hash_password(temp_password))

    print("Password reset for: " + user["username"] + " (" + email + ")")

    return jsonify({
        "success":       True,
        "temp_password": temp_password,
        "message":       "Temporary password set for " + user["username"] + ". Use it to log in."
    })


@app.route("/api/auth/me")
def get_current_user():
    if not session.get("user"):
        return jsonify({"logged_in": False}), 401
    return jsonify({
        "logged_in": True,
        "username":  session.get("username"),
        "user_id":   session.get("user"),
    })


@app.route("/api/auth/users")
def list_users():
    all_users = load_all_users()
    safe = [{"user_id": u["user_id"], "username": u["username"], "email": u["email"],
             "created_at": u["created_at"], "last_login": u["last_login"]} for u in all_users]
    return jsonify({"total": len(safe), "users": safe})



# main routes


@app.route("/")
def home():
    if not session.get("user"):
        return redirect("/login")
    return send_from_directory(os.path.join(frontend_dir, "templates"), "index.html")


@app.route("/api/health")
def health_check():
    return jsonify({
        "status":       "ok",
        "model_loaded": model_is_ready,
        "skill_engine": {
            "trigger_count": len(skill_relationships),
            "alias_count":   len(skill_aliases),
        },
        "model_info": {
            "cv_mae":    model_info.get("cv_mae_mean"),
            "cv_r2":     model_info.get("cv_r2_mean"),
            "n_samples": model_info.get("n_training_samples"),
            "n_trees":   model_info.get("n_estimators"),
        } if model_is_ready else {}
    })


@app.route("/api/domains")
def get_domains():
    return jsonify({"domains": list(domain_skills.keys())})


@app.route("/api/analyze", methods=["POST", "OPTIONS"])
def analyze_resume():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    uploaded_file = request.files["file"]
    target_domain = request.form.get("domain", "Data Science")
    jd_text = (request.form.get("job_description") or "").strip()

    if not uploaded_file.filename:
        return jsonify({"error": "Please select a file before submitting."}), 400

    file_ext = uploaded_file.filename.rsplit(".", 1)[-1].lower() if "." in uploaded_file.filename else ""
    image_types = {"png","jpg","jpeg","gif","bmp","webp","svg","tiff","ico","heic","heif"}

    if file_ext in image_types:
        return jsonify({
            "error":   "Images are not supported.",
            "message": "You uploaded a ." + file_ext + " image. Please upload your resume as a PDF, DOCX, or TXT file.",
            "fix":     "Export your resume as PDF from Word or Google Docs."
        }), 400

    if file_ext not in ("pdf", "docx", "txt"):
        return jsonify({
            "error":   "Unsupported file type: ." + file_ext,
            "message": "Only PDF, Word (.docx), and plain text (.txt) files are accepted.",
            "fix":     "Save your resume as a PDF or TXT file and try again."
        }), 400

    uploaded_file.seek(0, 2)
    file_size = uploaded_file.tell()
    uploaded_file.seek(0)
    if file_size == 0:
        return jsonify({"error": "The file you uploaded is empty. Please upload a resume with content."}), 400

    safe_name = secure_filename(uploaded_file.filename)
    temp_path = os.path.join(uploads_dir, safe_name)
    uploaded_file.save(temp_path)

    try:
        resume_text = read_resume_file(temp_path, safe_name)
        skills_needed = domain_skills.get(target_domain, domain_skills["Data Science"])
        cleaned = (resume_text or "").strip()
        word_count = len(cleaned.split())

        if not cleaned:
            return jsonify({
                "error":        "empty_resume",
                "message":      "Could not read any text from your resume.",
                "detail":       "This can happen with scanned PDFs. Try uploading a TXT file instead.",
                "resume_score": 0,
                "word_count":   0,
                "fix":          "Use a text-based PDF or a plain .txt file."
            }), 422

        if word_count < 10:
            return jsonify({
                "error":        "insufficient_content",
                "message":      "Your resume only has " + str(word_count) + " word(s). That is not enough to analyze.",
                "detail":       "A real resume should have at least 50-100 words.",
                "resume_score": 0,
                "word_count":   word_count,
                "fix":          "Add your skills, experience, education, and projects."
            }), 422

        features, matched, related, missing, cosine, triggers = extract_features(cleaned, target_domain, skills_needed)
        experience, _ = detect_experience_level(cleaned)

        if model_is_ready:
            raw_score = float(rf_model.predict([features])[0])
        else:
            f = features
            raw_score = (0.45*f[0] + 0.20*f[1] + 0.15*f[3] + 0.10*f[7] + 0.05*f[4] + 0.05*f[5]) * 100

        if len(matched) == 0 and len(related) == 0:
            raw_score = 0.0

        final_score = int(np.clip(round(raw_score), 0, 98))

        all_known_skills = [s for skills in domain_skills.values() for s in skills]
        extracted_skills = list(dict.fromkeys(
            s for s in all_known_skills if s.lower() in cleaned.lower()
        ))[:20]

        result = {
            "domain":           target_domain,
            "filename":         safe_name,
            "word_count":       word_count,
            "resume_score":     final_score,
            "rf_raw":           round(raw_score, 2),
            "cosine_similarity":round(cosine * 100),
            "experience_level": experience,
            "matched_skills":       matched,
            "related_skills":       related,
            "related_skill_names":  [r["skill"] for r in related],
            "missing_skills":       missing,
            "skill_counts": {
                "matched": len(matched),
                "related": len(related),
                "missing": len(missing),
                "total":   len(skills_needed),
            },
            "ats_note": (
                str(len(matched)) + " directly matched, " +
                str(len(related)) + " implied by domain keywords, " +
                str(len(missing)) + " not found"
            ),
            "detected_triggers": sorted(list(triggers)),
            "extracted_skills":  extracted_skills,
            "feature_vector":    [round(v, 4) for v in features],
            "feature_names":     feature_names,
            "suggestions":       build_suggestions(missing, related, final_score),
            "summary":           build_summary(target_domain, experience, matched, related, final_score),
            "model_metrics": {
                "cv_mae":    model_info.get("cv_mae_mean",      "N/A"),
                "cv_r2":     model_info.get("cv_r2_mean",       "N/A"),
                "n_samples": model_info.get("n_training_samples", 600),
                "n_trees":   model_info.get("n_estimators",      100),
                "loaded":    model_is_ready,
            },
            "jd_analysis": analyze_job_description(jd_text, cleaned) if jd_text else None,
        }

        return jsonify(result)

    except Exception as error:
        return jsonify({"error": str(error), "trace": traceback.format_exc()}), 500
    finally:
        try:
            os.remove(temp_path)
        except Exception:
            pass



# start server


if __name__ == "__main__":
    print("ResumeML is starting...")
    print("Skill triggers loaded:", len(skill_relationships))
    print("Skill aliases loaded: ", len(skill_aliases))
    port  = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("RENDER") is None
    app.run(host="0.0.0.0", port=port, debug=debug)
