FROM python:3.12-slim
WORKDIR /app
COPY apps/recommender/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY apps/recommender/app ./app
COPY apps/recommender/data ./data
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
