exports.ocr = onRequest(async (req, res) => {
  if (req.method != "POST") {
    return res.status(405).end();
  }

  const busboy = busboyPack({headers: req.headers});
  const auth = new GoogleAuth({
    keyFilename: "./app-test-406706-2791e8da4313.json",
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  const client = new vision.ImageAnnotatorClient({
    auth: auth,
    credentials: {
      private_key: "AIzaSyDWIGQElIQPyDVOTK9JgMfBqggNNLnMOLM",
    },
    projectId: "app-test-406706",
  });

  /**
   * @param {Buffer} image
   * @return {Promise<string[]>}
   */
  async function detect(image) {
    const [result] = await client.textDetection(image);
    const detections = result.textAnnotations;

    const results = [];

    logger.info("Text:");
    const dis = Hangul.disassemble(detections[0].description, true);
    logger.info(results);

    return dis;
  }

  const results = [];

  let fileData = Buffer.alloc(0);

  busboy.on("file", async (fieldname, file, {filename}) => {
    file.on("data", (data) => {
      fileData = Buffer.concat([fileData, data]);
    });
  });

  // 점자는 왼쪽 위에서 아래로 1, 2, 3
  // 오른쪽 위에서 아래로 4, 5, 6

  const table = {
    abbr: {
      "가": [0b110101],
      "나": [0b100100],
      "다": [0b010100],
      "바": [0b000110],
      "사": [0b111000],
      "자": [0b000101],
      "카": [0b110100],
      "타": [0b110010],
      "파": [0b100110],
      "하": [0b010110],
      "것": [0b000111, 0b011100],
      "억": [0b100111],
      "언": [0b011111],
      "얼": [0b011110],
      "연": [0b100001],
      "열": [0b110011],
      "영": [0b110111],
      "옥": [0b101101],
      "온": [0b111011],
      "옹": [0b111111],
      "운": [0b110110],
      "울": [0b111101],
      "은": [0b101011],
      "을": [0b011101],
      "인": [0b111110],
      "그래서": [0b100000, 0b011100],
      "그러나": [0b100000, 0b100100],
      "그러면": [0b100000, 0b010010],
      "그러므로": [0b100000, 0b010001],
      "그런데": [0b100000, 0b101110],
      "그리고": [0b100000, 0b101001],
      "그리하여": [0b100000, 0b100011],
    },
    cho_char: {
      "ㄱ": [0b000100],
      "ㄲ": [0b000001, 0b000100],
      "ㄴ": [0b100100],
      "ㄷ": [0b010100],
      "ㄸ": [0b000001, 0b010100],
      "ㄹ": [0b000010],
      "ㅁ": [0b100010],
      "ㅂ": [0b000110],
      "ㅃ": [0b000001, 0b000110],
      "ㅅ": [0b000001],
      "ㅆ": [0b000001, 0b000001],
      "ㅇ": [],
      "ㅈ": [0b000101],
      "ㅉ": [0b000001, 0b000101],
      "ㅊ": [0b000011],
      "ㅋ": [0b110100],
      "ㅌ": [0b110010],
      "ㅍ": [0b100110],
      "ㅎ": [0b010110],
    },
    jung_char: {
      "ㅏ": [0b110001],
      "ㅑ": [0b001110],
      "ㅓ": [0b011100],
      "ㅕ": [0b100011],
      "ㅗ": [0b101001],
      "ㅛ": [0b001101],
      "ㅜ": [0b101100],
      "ㅠ": [0b100101],
      "ㅡ": [0b010101],
      "ㅣ": [0b101010],
      "ㅐ": [0b111010],
      "ㅔ": [0b101110],
      "ㅚ": [0b101111],
      "ㅘ": [0b111001],
      "ㅝ": [0b111100],
      "ㅢ": [0b010111],
      "ㅖ": [0b001100],
      "ㅟ": [0b101100, 0b111010],
      "ㅒ": [0b001110, 0b111010],
      "ㅙ": [0b111001, 0b111010],
      "ㅞ": [0b111100, 0b111010],
    },
    jong_char: {
      "ㄱ": [0b100000],
      "ㄴ": [0b010010],
      "ㄷ": [0b001010],
      "ㄹ": [0b010000],
      "ㅁ": [0b010001],
      "ㅂ": [0b110000],
      "ㅅ": [0b001000],
      "ㅆ": [0b001100],
      "ㅇ": [0b011011],
      "ㅈ": [0b101000],
      "ㅊ": [0b011000],
      "ㅋ": [0b011010],
      "ㅌ": [0b011001],
      "ㅍ": [0b010011],
      "ㅎ": [0b001011],
    },
    num_char: {
      "1": [0b100000],
      "2": [0b110000],
      "3": [0b100100],
      "4": [0b100110],
      "5": [0b100010],
      "6": [0b110100],
      "7": [0b110110],
      "8": [0b110010],
      "9": [0b010100],
      "0": [0b010110],
      ".": [0b001000],
      ",": [0b010000],
    },
    spec_char: {
      ".": [0b010011],
      ",": [0b000010],
      "!": [0b011010],
      "?": [0b011001],
      ":": [0b000010, 0b010000],
      ";": [0b000011, 0b011000],
      "~": [0b001001, 0b001001],
      "(": [0b001001],
      ")": [0b001001],
    },
  };

  busboy.on("finish", async () => {
    const text = await detect(fileData);
    text.forEach((char) => {
      if (Object.keys(table.abbr).includes(Hangul.assemble(char))) {
        results.push(table.abbr[char]);
      } else {
        try {
          switch (char.length) {
            case 2:
              results.push(...table.cho_char[char[0]]);
              results.push(...table.jung_char[char[1]]);
              break;
            case 3:
              results.push(...table.cho_char[char[0]]);
              if (Hangul.isVowel(char[2])) { // 중성 2개가 있는 경우
                results.push(...table.jung_char[
                    Hangul.assemble([char[1], char[2]])
                ]);
              } else { // 중성, 종성이 있는 경우
                results.push(...table.jung_char[char[1]]);
                results.push(...table.jong_char[char[2]]);
              }
              break;
            case 4:
              results.push(...table.cho_char[char[0]]);
              results.push(...table.jung_char[
                  Hangul.assemble([char[1], char[2]])
              ]);
              results.push(...table.jong_char[char[4]]);
              break;
            default:
              results.push(...table.spec_char[char[0]]);
              break;
          }
        } catch (e) {
          results.push(null);
        }
      }
    });

    logger.info("Final Result:");
    logger.info(results);

    res.status(200).send(JSON.stringify({
      jumja_data: results,
    }));
  });

  busboy.end(req.rawBody);
});
