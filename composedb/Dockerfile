FROM whatscookin/whatscookin-composedb:2.11

WORKDIR /usr/src/app

RUN apt update

RUN apt install -y python3 python3-pip

ADD app ./

RUN pip3 install -r requirements.txt

CMD python3 main.py & cd /usr/scripts && node admin-did-script.js && npx --yes @ceramicnetwork/cli@2.11 daemon
