const units = {
  1: "hik",
  2: "altó",
  3: "iskí",
  4: "wálti",
  5: "číndi",
  6: "mishíndi",
  7: "thalé",
  8: "altambi",
  9: "huntí",
};

const engUnits = {
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
};

const tensPrefix = {
  2: "alto",
  3: "iski",
  4: "walti",
};

function createToken(word, english, type, op, val) {
  return { word, english, type, op, val };
}

function sep(char) {
  return { word: char, type: "separator", english: null, op: null, val: null };
}

function convert(num) {
  if (num === null || num === undefined || String(num).trim() === "") {
    return [];
  }

  const parsed = Number(num);

  if (Number.isNaN(parsed) || !Number.isInteger(parsed)) {
    throw new Error("Input must be a valid integer.");
  }
  if (parsed <= 0) {
    throw new Error(
      "Burushaski number system does not define zero or negative numbers."
    );
  }
  if (parsed > 1000000) {
    throw new Error("Maximum allowed value is 1,000,000.");
  }

  return convertCore(parsed, true);
}

function convertCore(num, isMain = false) {
  if (num < 10) {
    return [
      createToken(units[num], engUnits[num], isMain ? "unit" : "remainder", num, num),
    ];
  }

  if (num === 10) {
    return [
      createToken("torimi", "Ten", isMain ? "unit" : "remainder", 10, 10),
    ];
  }

  if (num < 20) {
    const r = num - 10;
    return [
      createToken("turma", "Ten Plus", "base", "+ 10", 10),
      sep("-"),
      createToken(units[r], engUnits[r], "remainder", `+ ${r}`, r),
    ];
  }

  if (num < 100) {
    return convertBelow100(num);
  }
  if (num < 1000) {
    return convertHundreds(num);
  }
  if (num < 1000000) {
    return convertThousands(num);
  }
  if (num === 1000000) {
    return [
      createToken("saas-tha", "One Million", "base", "1000000", 1000000),
    ];
  }
}

function convertBelow100(num) {
  const twenties = Math.floor(num / 20);
  const remainder = num % 20;
  let tokens = [];

  if (twenties > 0) {
    if (twenties === 1) {
      tokens.push(createToken("altar", "Twenty", "base", "× 20", 20));
    } else {
      tokens.push(createToken(tensPrefix[twenties], engUnits[twenties], "multiplier", twenties, twenties));
      tokens.push(sep("-"));
      tokens.push(createToken("altar", "Twenty", "base", "× 20", 20));
    }
  }

  if (remainder === 0) {
    return tokens;
  }

  tokens.push(sep("-"));

  if (remainder === 10) {
    tokens.push(createToken("turma", "Ten", "remainder", "+ 10", 10));
  } else if (remainder < 10) {
    tokens.push(createToken(units[remainder], engUnits[remainder], "remainder", `+ ${remainder}`, remainder));
  } else {
    const r = remainder - 10;
    tokens.push(createToken("turma", "Ten Plus", "base", "+ 10", 10));
    tokens.push(sep("-"));
    tokens.push(createToken(units[r], engUnits[r], "remainder", `+ ${r}`, r));
  }

  return tokens;
}

function convertHundreds(num) {
  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;
  let tokens = [];

  if (num === 100) {
    tokens.push(createToken("hik", "One", "multiplier", 1, 1));
    tokens.push(sep(" "));
    tokens.push(createToken("tha", "Hundred", "base", "× 100", 100));
    return tokens;
  }

  tokens.push(createToken(units[hundreds], engUnits[hundreds], "multiplier", hundreds, hundreds));
  tokens.push(sep(" "));
  tokens.push(createToken("tha", "Hundred", "base", "× 100", 100));

  if (remainder === 0) {
    return tokens;
  }

  tokens.push(sep(" "));
  tokens.push(createToken("ke", "And", "operator", "+", null));
  tokens.push(sep(" "));

  tokens = tokens.concat(convertCore(remainder));
  return tokens;
}

function convertThousands(num) {
  const thousands = Math.floor(num / 1000);
  const remainder = num % 1000;
  let tokens = [];

  if (thousands === 1) {
    tokens.push(createToken("saas", "Thousand", "base", "× 1000", 1000));
  } else {
    tokens = tokens.concat(convertCore(thousands));
    tokens.push(sep(" "));
    tokens.push(createToken("saas", "Thousand", "base", "× 1000", 1000));
  }

  if (remainder === 0) {
    return tokens;
  }

  tokens.push(sep(" "));
  tokens.push(createToken("ke", "And", "operator", "+", null));
  tokens.push(sep(" "));

  tokens = tokens.concat(convertCore(remainder));
  return tokens;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { convert, units };
} else {
  window.convert = convert;
}
