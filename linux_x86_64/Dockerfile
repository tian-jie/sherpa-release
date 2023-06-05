FROM ubuntu
RUN apt-get update && apt-get upgrade -y && apt-get install -y python3.10 pip git cmake g++ git-lfs && ln /usr/bin/python3.10 /usr/bin/python
RUN pip install pyOpenSSL numpy

WORKDIR /
RUN git clone https://github.com/k2-fsa/sherpa-onnx.git \
    && cd sherpa-onnx && mkdir build && cd build \
    && cmake \
      -DSHERPA_ONNX_ENABLE_PYTHON=ON \
      -DBUILD_SHARED_LIBS=ON \
      -DSHERPA_ONNX_ENABLE_CHECK=OFF \
      -DSHERPA_ONNX_ENABLE_PORTAUDIO=OFF \
      -DSHERPA_ONNX_ENABLE_C_API=OFF \
      -DSHERPA_ONNX_ENABLE_WEBSOCKET=OFF \
      .. \
    && make -j && export PYTHONPATH=$PWD/../sherpa-onnx/python/:$PWD/lib:$PYTHONPATH

RUN git clone https://github.com/tian-jie/sherpa-release.git \
    && cd /sherpa-release/linux_x86_64/web-app/web \
    && python generate-certificate.py 

WORKDIR /sherpa-release/linux_x86_64/web-app
#RUN git lfs install \
#    && git clone https://huggingface.co/csukuangfj/sherpa-onnx-streaming-zipformer-bilingual-zh-en-2023-02-20 traindata

EXPOSE 6006

#ENTRYPOINT python streaming_server.py --rule3-min-utterance-length 1000.0 --port 6006 --max-batch-size 50 --max-wait-ms 5 --nn-pool-size 1 --tokens ./traindata/tokens.txt --encoder-model ./traindata/encoder-epoch-99-avg-1.onnx --decoder-model ./traindata/decoder-epoch-99-avg-1.onnx --joiner-model ./traindata/joiner-epoch-99-avg-1.onnx --certificate ./web/cert.pem --doc-root ./web

ENTRYPOINT /bin/sh