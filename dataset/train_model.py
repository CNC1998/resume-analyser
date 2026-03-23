# train_model.py
# --------------
# Run this AFTER generate_dataset.py.
# Reads resume_dataset.csv, trains a Random Forest, and saves the model.
#
# Usage:  python train_model.py
# Output: ../model/resume_rf_model.pkl
#         ../model/model_metadata.json

import pandas as pd
import numpy as np
import joblib
import json
import os

from sklearn.ensemble        import RandomForestRegressor
from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.metrics         import mean_absolute_error, r2_score


# file paths
dataset_path  = os.path.join(os.path.dirname(__file__), "resume_dataset.csv")
model_folder  = os.path.join(os.path.dirname(__file__), "..", "model")
model_path    = os.path.join(model_folder, "resume_rf_model.pkl")
metadata_path = os.path.join(model_folder, "model_metadata.json")


# these are the 8 columns the model uses as input
feature_columns = [
    "match_ratio",       # fraction of required skills the person has
    "cosine_sim",        # how similar the resume is to the job domain text
    "skill_density",     # skills per 100 words in the resume
    "exp_bonus",         # experience level (0.3 = entry, 0.6 = mid, 0.9 = senior)
    "keyword_overlap",   # fraction of domain keywords found in the resume
    "seniority_signal",  # how many seniority words appear
    "domain_term_freq",  # average frequency of domain terms
    "skill_depth"        # does the person have the most important skills
]

target_column = "score"


# domain skills are saved here so the Flask app can load them from metadata.json
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


def load_data():
    """Load the CSV and do a quick sanity check before training."""
    if not os.path.exists(dataset_path):
        print("ERROR: Dataset not found at: " + dataset_path)
        print("Please run generate_dataset.py first.")
        exit()

    df = pd.read_csv(dataset_path)
    print("Loaded " + str(len(df)) + " samples, " + str(len(df.columns)) + " columns")
    print("Domains: " + str(df["domain"].nunique()))
    print("Score range: " + str(df["score"].min()) + " to " + str(df["score"].max()))

    missing_count = df[feature_columns + [target_column]].isnull().sum().sum()
    if missing_count > 0:
        print("Warning: found " + str(missing_count) + " missing values")
    else:
        print("No missing values")

    return df


def train(df):
    """
    Train the Random Forest model and evaluate it.
    We split 80/20 for train/test, then also run 5-fold cross validation
    to get a more reliable accuracy estimate.
    """
    X = df[feature_columns].values
    y = df[target_column].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    print("")
    print("Training: " + str(len(X_train)) + " samples")
    print("Testing:  " + str(len(X_test))  + " samples")

    # 100 trees, max depth 8, using sqrt feature subsets per split
    model = RandomForestRegressor(
        n_estimators      = 100,
        max_depth         = 8,
        min_samples_split = 4,
        min_samples_leaf  = 2,
        max_features      = "sqrt",
        random_state      = 42,
        n_jobs            = -1
    )

    print("")
    print("Training Random Forest (100 trees)...")
    model.fit(X_train, y_train)
    print("Training complete!")

    predictions = model.predict(X_test)
    test_mae    = mean_absolute_error(y_test, predictions)
    test_r2     = r2_score(y_test, predictions)

    print("")
    print("Test results:")
    print("  MAE:  " + str(round(test_mae, 2)) + " points  (lower is better)")
    print("  R2:   " + str(round(test_r2,  4)) + "         (1.0 = perfect)")

    print("")
    print("Running 5-fold cross validation...")
    kfold        = KFold(n_splits=5, shuffle=True, random_state=42)
    cv_mae_scores = -cross_val_score(model, X, y, cv=kfold, scoring="neg_mean_absolute_error")
    cv_r2_scores  =  cross_val_score(model, X, y, cv=kfold, scoring="r2")

    print("  CV MAE: " + str(round(cv_mae_scores.mean(), 2)) + " +/- " + str(round(cv_mae_scores.std(), 2)))
    print("  CV R2:  " + str(round(cv_r2_scores.mean(),  4)) + " +/- " + str(round(cv_r2_scores.std(), 4)))

    # which features matter the most
    importance = pd.Series(model.feature_importances_, index=feature_columns)
    importance = importance.sort_values(ascending=False)
    print("")
    print("Feature importance:")
    for name, score in importance.items():
        bar = "#" * int(score * 50)
        print("  " + name.ljust(22) + str(round(score, 4)) + "  " + bar)

    metadata = {
        "model_type":           "RandomForestRegressor",
        "n_estimators":         100,
        "max_depth":            8,
        "features":             feature_columns,
        "n_training_samples":   int(len(X_train)),
        "n_test_samples":       int(len(X_test)),
        "test_mae":             round(float(test_mae), 2),
        "test_r2":              round(float(test_r2),  4),
        "cv_mae_mean":          round(float(cv_mae_scores.mean()), 2),
        "cv_mae_std":           round(float(cv_mae_scores.std()),  2),
        "cv_r2_mean":           round(float(cv_r2_scores.mean()),  4),
        "cv_r2_std":            round(float(cv_r2_scores.std()),   4),
        "domain_skills":        domain_skills
    }

    return model, metadata


def save_model(model, metadata):
    """Save the trained model and metadata to the model folder."""
    os.makedirs(model_folder, exist_ok=True)

    joblib.dump(model, model_path)
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    size_kb = os.path.getsize(model_path) / 1024
    print("")
    print("Model saved to:    " + model_path + "  (" + str(round(size_kb, 1)) + " KB)")
    print("Metadata saved to: " + metadata_path)


if __name__ == "__main__":
    print("=" * 50)
    print("ResumeML - Model Training")
    print("=" * 50)
    print("")

    print("Step 1: Loading dataset...")
    df = load_data()

    print("")
    print("Step 2: Training model...")
    model, metadata = train(df)

    print("")
    print("Step 3: Saving model...")
    save_model(model, metadata)

    print("")
    print("=" * 50)
    print("Done! Now run:")
    print("  cd ../backend")
    print("  python app.py")
    print("=" * 50)
