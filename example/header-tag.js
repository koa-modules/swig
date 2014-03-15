exports.compile = function (compiler, args, content, parents, options, blockName) {
  return compiler(content, parents, options, blockName);
};

exports.parse = function (str, line, parser, types) {
  parser.on('*', function (token) {
    console.log(token);
  });
  return true;
};

exports.ends = true;
