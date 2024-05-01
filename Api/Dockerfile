FROM python:3.11

ENV PYTHONUNBUFFERED=1

WORKDIR /usr/src/app

COPY requirements.txt db_manager.py ./

RUN pip install --upgrade pip

RUN pip install -r requirements.txt

ENV DATABASE_URL='postgresql://postgres:123456@db:5432/players'

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "-w", "1", "db_manager:app"]