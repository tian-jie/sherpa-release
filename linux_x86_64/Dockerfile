FROM ubuntu
RUN apt-get update && apt-get upgrade -y 

RUN apt-get install -y python3.10 pip git git-lfs && \
    ln /usr/bin/python3.10 /usr/bin/python && \
    pip install pyOpenSSL websockets numpy

WORKDIR /
RUN git clone https://github.com/tian-jie/sherpa-release.git \
    && mkdir /app \
    && cp sherpa-release/web-app /app/web/ -r \
    && cd /app/web && ./generate-certificate.py

# RUN git lfs install \
#      && git clone https://huggingface.co/csukuangfj/sherpa-onnx-streaming-zipformer-bilingual-zh-en-2023-02-20 /app/traindata

EXPOSE 6006

WORKDIR /app
ENV PYTHONPATH='/app/python;/app/lib'

ENTRYPOINT ./streaming_server.py --rule3-min-utterance-length 1000.0 --port 6006 --max-batch-size 50 --max-wait-ms 5 --nn-pool-size 1 --tokens ./traindata/tokens.txt --encoder-model ./traindata/encoder-epoch-99-avg-1.onnx --decoder-model ./traindata/decoder-epoch-99-avg-1.onnx --joiner-model ./traindata/joiner-epoch-99-avg-1.onnx --certificate ./web/cert.pem --doc-root ./web


