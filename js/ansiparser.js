(function() {
  var __hasProp = Object.prototype.hasOwnProperty;
  this.ANSIParser = (function() {
    var argbuf, attr, palette, save_x, save_y, screen, state, x, y;
    state = 0;
    x = 0;
    y = 0;
    save_x = 0;
    save_y = 0;
    attr = 7;
    screen = [];
    argbuf = '';
    palette = ['#000', '#a00', '#0a0', '#a50', '#00a', '#a0a', '#0aa', '#aaa', '#555', '#f55', '#5f5', '#ff5', '#55f', '#f5f', '#5ff', '#fff'];
    function ANSIParser(options) {
      var k, v;
      this.tabstop = 8;
      this.linewrap = 80;
      for (k in options) {
        if (!__hasProp.call(options, k)) continue;
        v = options[k];
        this[k] = v;
      }
    }
    ANSIParser.prototype.parse_url = function(url) {
      var content, req;
      req = new XMLHttpRequest;
      req.open('GET', url, false);
      req.overrideMimeType('text/plain; charset=x-user-defined');
      req.send(null);
      content = req.status === 200 || req.status === 0 ? req.responseText : '';
      return this.parse(content);
    };
    ANSIParser.prototype.parse = function(content) {
      var arg, args, ch, i, _i, _len, _ref, _ref2, _ref3, _ref4, _ref5, _results;
      content = content.split('');
      _results = [];
      while (ch = content.shift()) {
        if (state === 0) {
          switch (ch) {
            case "\x1a":
              state = 3;
              break;
            case "\x1b":
              state = 1;
              break;
            case "\n":
              x = 0;
              y++;
              break;
            case "\r":
              break;
            case "\t":
              i = (x + 1) % this.tabstop;
              while (i-- > 0) {
                this.putpixel(' ');
              }
              break;
            default:
              this.putpixel(ch);
          }
        } else if (state === 1) {
          if (ch !== "[") {
            this.putpixel("\x1b");
            this.putpixel("[");
            state = 0;
          } else {
            state = 2;
          }
        } else if (state === 2) {
          if (ch.match('[A-Za-z]')) {
            args = (function() {
              var _i, _len, _ref, _results;
              _ref = argbuf.split(';');
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                i = _ref[_i];
                _results.push(parseInt(i));
              }
              return _results;
            })();
            switch (ch) {
              case "m":
                for (_i = 0, _len = args.length; _i < _len; _i++) {
                  arg = args[_i];
                  if (arg === 0) {
                    attr = 7;
                  } else if (arg === 1) {
                    attr |= 8;
                  } else if (arg === 5) {
                    attr |= 128;
                  } else if ((30 <= arg && arg <= 37)) {
                    attr &= 248;
                    attr |= arg - 30;
                  } else if ((40 <= arg && arg <= 47)) {
                    attr &= 143;
                    attr |= (arg - 40) << 4;
                  }
                }
                break;
              case "H":
              case "f":
                y = (args[0] || 1) - 1;
                x = (args[1] || 1) - 1;
                if (y < 0) {
                  y = 0;
                }
                if (x < 0) {
                  x = 0;
                }
                break;
              case "A":
                y -= args[0] || 1;
                if (y < 0) {
                  y = 0;
                }
                break;
              case "B":
                y += args[0] || 1;
                break;
              case "C":
                x += args[0] || 1;
                break;
              case "D":
                x -= args[0] || 1;
                if (x < 0) {
                  x = 0;
                }
                break;
              case "E":
                y += args[0] || 1;
                x = 0;
                break;
              case "F":
                y -= args[0] || 1;
                if (y > 0) {
                  y = 0;
                }
                x = 0;
                break;
              case "G":
                x = (args[0] || 1) - 1;
                break;
              case "s":
                save_x = x;
                save_y = y;
                break;
              case "u":
                x = save_x;
                y = save_y;
                break;
              case "J":
                if (args.length === 0 || args[0] === 0) {
                  for (i = _ref = y + 1, _ref2 = screen.length - 1; (_ref <= _ref2 ? i <= _ref2 : i >= _ref2); (_ref <= _ref2 ? i += 1 : i -= 1)) {
                    screen[i] = null;
                  }
                  for (i = x, _ref3 = screen[y].length - 1; (x <= _ref3 ? i <= _ref3 : i >= _ref3); (x <= _ref3 ? i += 1 : i -= 1)) {
                    screen[y][i] = null;
                  }
                } else if (args[0] === 1) {
                  for (i = 0, _ref4 = y - 1; (0 <= _ref4 ? i <= _ref4 : i >= _ref4); (0 <= _ref4 ? i += 1 : i -= 1)) {
                    screen[i] = null;
                  }
                  for (i = 0; (0 <= x ? i <= x : i >= x); (0 <= x ? i += 1 : i -= 1)) {
                    screen[y][i] = null;
                  }
                } else if (args[0] === 2) {
                  x = 0;
                  y = 0;
                  screen = [];
                }
                break;
              case "K":
                if (args.length === 0 || args[0] === 0) {
                  for (i = x, _ref5 = screen[y].length - 1; (x <= _ref5 ? i <= _ref5 : i >= _ref5); (x <= _ref5 ? i += 1 : i -= 1)) {
                    screen[y][i] = null;
                  }
                } else if (args[0] === 1) {
                  for (i = 0; (0 <= x ? i <= x : i >= x); (0 <= x ? i += 1 : i -= 1)) {
                    screen[y][i] = null;
                  }
                } else if (args[0] === 2) {
                  screen[y] = null;
                }
            }
            argbuf = '';
            state = 0;
          } else {
            argbuf += ch;
          }
        } else if (state === 3) {
          break;
        } else {
          state = 0;
        }
      }
      return _results;
    };
    ANSIParser.prototype.putpixel = function(ch) {
      if (!(screen[y] != null)) {
        screen[y] = [];
      }
      screen[y][x] = {
        'ch': ch,
        'attr': attr
      };
      if (++x >= this.linewrap) {
        x = 0;
        return y++;
      }
    };
    ANSIParser.prototype.render_canvas = function(htmlcanvas) {
      var bg, canvas, ctx, cx, cy, fg, h, pixel, px, py, w, _ref, _ref2;
      canvas = document.createElement('canvas');
      w = this.linewrap * 8;
      h = screen.length * 16;
      canvas.setAttribute('width', w);
      canvas.setAttribute('height', h);
      ctx = canvas.getContext('2d');
      ctx.font = '16px "8x16"';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      for (cy = 0, _ref = screen.length - 1; (0 <= _ref ? cy <= _ref : cy >= _ref); (0 <= _ref ? cy += 1 : cy -= 1)) {
        if (!(screen[cy] != null)) {
          continue;
        }
        for (cx = 0, _ref2 = screen[cy].length - 1; (0 <= _ref2 ? cx <= _ref2 : cx >= _ref2); (0 <= _ref2 ? cx += 1 : cx -= 1)) {
          pixel = screen[cy][cx];
          if (!(pixel != null)) {
            continue;
          }
          fg = pixel.attr & 15;
          bg = (pixel.attr & 240) >> 4;
          px = cx * 8;
          py = cy * 16;
          ctx.fillStyle = palette[bg];
          ctx.fillRect(px, py, 8, 16);
          ctx.fillStyle = palette[fg];
          ctx.fillText(String.fromCharCode(pixel.ch.charCodeAt(0) & 0xff), px, py);
        }
      }
      htmlcanvas.setAttribute('width', w);
      htmlcanvas.setAttribute('height', h);
      ctx = htmlcanvas.getContext('2d');
      return ctx.drawImage(canvas, 0, 0);
    };
    return ANSIParser;
  })();
}).call(this);
