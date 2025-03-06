Ext.define('Ext.ux.colorpick.Selection', {
    mixinId: 'colorselection',
    config: {
        /**
         * @cfg {"hex6","hex8","#hex6","#hex8","HEX6","HEX8","#HEX6","#HEX8"} [format=hex6]
         * The color format to for the `value` config. The `value` can be set using any
         * supported format or named color, but the stored value will always be in this
         * format.
         *
         * Supported formats are:
         *
         * - hex6 - For example "ffaa00" (Note: does not preserve transparency).
         * - hex8 - For eaxmple "ffaa00ff" - the last 2 digits represent transparency
         * - #hex6 - For example "#ffaa00" (same as "hex6" but with a leading "#").
         * - #hex8 - For example "#ffaa00ff" (same as "hex8" but with a leading "#").
         * - HEX6 - Same as "hex6" but upper case.
         * - HEX8 - Same as "hex8" but upper case.
         * - #HEX6 - Same as "#hex6" but upper case.
         * - #HEX8 - Same as "#hex8" but upper case.
         */
        format: 'hex6',
        /**
         * @cfg {String} [value=FF0000]
         * The initial color to highlight; see {@link #format} for supported formats.
         */
        value: 'FF0000',
        /**
         * @cfg {Object} color
         * This config property is used internally by the UI to maintain the full color.
         * Changes to this config are automatically reflected in `value` and vise-versa.
         * Setting `value` can, however, cause the alpha to be dropped if the new value
         * does not contain an alpha component.
         * @private
         */
        color: null,
        previousColor: null
    },
    applyColor: function(color) {
        var c = color;
        if (Ext.isString(c)) {
            c = Ext.ux.colorpick.ColorUtils.parseColor(color);
        }
        return c;
    },
    applyValue: function(color) {
        // Transform whatever incoming color we get to the proper format
        var c = Ext.ux.colorpick.ColorUtils.parseColor(color);
        return this.formatColor(c);
    },
    formatColor: function(color) {
        return Ext.ux.colorpick.ColorUtils.formats[this.getFormat()](color);
    },
    updateColor: function(color) {
        var me = this;
        // If the "color" is changed (via internal changes in the UI), update "value" as
        // well. Since these are always tracking each other, we guard against the case
        // where we are being updated *because* "value" is being set.
        if (!me.syncing) {
            me.syncing = true;
            me.setValue(me.formatColor(color));
            me.syncing = false;
        }
    },
    updateValue: function(value, oldValue) {
        var me = this;
        // If the "value" is changed, update "color" as well. Since these are always
        // tracking each other, we guard against the case where we are being updated
        // *because* "color" is being set.
        if (!me.syncing) {
            me.syncing = true;
            me.setColor(value);
            me.syncing = false;
        }
        this.fireEvent('change', me, value, oldValue);
    }
});

Ext.define('Ext.ux.colorpick.ColorUtils', function(ColorUtils) {
    var oldIE = Ext.isIE && Ext.ieVersion < 10;
    return {
        singleton: true,
        constructor: function() {
            ColorUtils = this;
        },
        backgroundTpl: oldIE ? 'filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0, ' + 'startColorstr=\'#{alpha}{hex}\', endColorstr=\'#{alpha}{hex}\');' : 'background: {rgba};',
        setBackground: oldIE ? function(el, color) {
            if (el) {
                var tpl = Ext.XTemplate.getTpl(ColorUtils, 'backgroundTpl'),
                    data = {
                        hex: ColorUtils.rgb2hex(color.r, color.g, color.b),
                        alpha: Math.floor(color.a * 255).toString(16)
                    },
                    bgStyle = tpl.apply(data);
                el.applyStyles(bgStyle);
            }
        } : function(el, color) {
            if (el) {
                var tpl = Ext.XTemplate.getTpl(ColorUtils, 'backgroundTpl'),
                    data = {
                        rgba: ColorUtils.getRGBAString(color)
                    },
                    bgStyle = tpl.apply(data);
                el.applyStyles(bgStyle);
            }
        },
        // parse and format functions under objects that match supported format config
        // values of the color picker; parse() methods recieve the supplied color value
        // as a string (i.e "FFAAAA") and return an object form, just like the one
        // ColorPickerModel vm "selectedColor" uses. That same object form is used as a
        // parameter to the format() methods, where the appropriate string form is expected
        // for the return result
        formats: {
            // "FFAA00"
            HEX6: function(colorO) {
                return ColorUtils.rgb2hex(colorO.r, colorO.g, colorO.b);
            },
            // "FFAA00FF" (last 2 are opacity)
            HEX8: function(colorO) {
                var hex = ColorUtils.rgb2hex(colorO.r, colorO.g, colorO.b),
                    opacityHex = Math.round(colorO.a * 255).toString(16);
                if (opacityHex.length < 2) {
                    hex += '0';
                }
                hex += opacityHex.toUpperCase();
                return hex;
            }
        },
        hexRe: /#?([0-9a-f]{3,8})/i,
        rgbaAltRe: /rgba\(\s*([\w#\d]+)\s*,\s*([\d\.]+)\s*\)/,
        rgbaRe: /rgba\(\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*\)/,
        rgbRe: /rgb\(\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*\)/,
        /**
         * Turn a string to a color object. Supports these formats:
         *
         * - "#ABC" (HEX short)
         * - "#ABCDEF" (HEX)
         * - "#ABCDEFDD" (HEX with opacity)
         * - "red" (named colors - see {@link #colorMap} source code for a full list)
         * - "rgba(r,g,b,a)" i.e "rgba(255,0,0,1)" (a == alpha == 0-1)
         * - "rgba(red, 0.4)"
         * - "rgba(#ABC, 0.9)"
         * - "rgba(#ABCDEF, 0.8)"
         *
         * @param {String} color The color string to parse.
         * @return {Object} Object with various color properties.
         * @return {Number} return.r The red component (0-255).
         * @return {Number} return.g The green component (0-255).
         * @return {Number} return.b The blue component (0-255).
         * @return {Number} return.a The red component (0-1).
         * @return {Number} return.h The hue component (0-1).
         * @return {Number} return.s The saturation component (0-1).
         * @return {Number} return.v The value component (0-1).
         */
        parseColor: function(color) {
            if (!color) {
                return null;
            }
            var me = this,
                rgb = me.colorMap[color],
                match, ret, hsv;
            if (rgb) {
                ret = {
                    r: rgb[0],
                    g: rgb[1],
                    b: rgb[2],
                    a: 1
                };
            } else if (color === 'transparent') {
                ret = {
                    r: 0,
                    g: 0,
                    b: 0,
                    a: 0
                };
            } else {
                match = me.hexRe.exec(color);
                if (match) {
                    match = match[1];
                    // the captured hex
                    switch (match.length) {
                        default:
                            return null;
                        case 3:
                            ret = {
                                //double the number (e.g. 6 - > 66, a -> aa) and convert to decimal
                                r: parseInt(match[0] + match[0], 16),
                                g: parseInt(match[1] + match[1], 16),
                                b: parseInt(match[2] + match[2], 16),
                                a: 1
                            };
                            break;
                        case 6:
                        case 8:
                            ret = {
                                r: parseInt(match.substr(0, 2), 16),
                                g: parseInt(match.substr(2, 2), 16),
                                b: parseInt(match.substr(4, 2), 16),
                                a: parseInt(match.substr(6, 2) || 'ff', 16) / 255
                            };
                            break;
                    }
                } else {
                    match = me.rgbaRe.exec(color);
                    if (match) {
                        // proper css => rgba(r,g,b,a)
                        ret = {
                            r: parseFloat(match[1]),
                            g: parseFloat(match[2]),
                            b: parseFloat(match[3]),
                            a: parseFloat(match[4])
                        };
                    } else {
                        match = me.rgbaAltRe.exec(color);
                        if (match) {
                            // scss shorthands =? rgba(red, 0.4), rgba(#222, 0.9), rgba(#444433, 0.8)
                            ret = me.parseColor(match[1]);
                            // we have HSV filled in, so poke on "a" and we're done
                            ret.a = parseFloat(match[2]);
                            return ret;
                        }
                        match = me.rgbRe.exec(color);
                        if (match) {
                            ret = {
                                r: parseFloat(match[1]),
                                g: parseFloat(match[2]),
                                b: parseFloat(match[3]),
                                a: 1
                            };
                        } else {
                            return null;
                        }
                    }
                }
            }
            hsv = this.rgb2hsv(ret.r, ret.g, ret.b);
            return Ext.apply(ret, hsv);
        },
        /**
         *
         * @param rgba
         * @return {String}
         */
        getRGBAString: function(rgba) {
            return "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + "," + rgba.a + ")";
        },
        /**
         * Returns a rgb css string whith this color (without the alpha channel)
         * @param rgb
         * @return {String}
         */
        getRGBString: function(rgb) {
            return "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
        },
        /**
         * Following standard math to convert from hsl to rgb
         * Check out wikipedia page for more information on how this works
         * h => [0,1]
         * s,l => [0,1]
         * @param h
         * @param s
         * @param v
         * @return {Object} An object with "r", "g" and "b" color properties.
         */
        hsv2rgb: function(h, s, v) {
            h = h * 360;
            if (h === 360) {
                h = 0;
            }
            var c = v * s;
            var hprime = h / 60;
            var x = c * (1 - Math.abs(hprime % 2 - 1));
            var rgb = [
                    0,
                    0,
                    0
                ];
            switch (Math.floor(hprime)) {
                case 0:
                    rgb = [
                        c,
                        x,
                        0
                    ];
                    break;
                case 1:
                    rgb = [
                        x,
                        c,
                        0
                    ];
                    break;
                case 2:
                    rgb = [
                        0,
                        c,
                        x
                    ];
                    break;
                case 3:
                    rgb = [
                        0,
                        x,
                        c
                    ];
                    break;
                case 4:
                    rgb = [
                        x,
                        0,
                        c
                    ];
                    break;
                case 5:
                    rgb = [
                        c,
                        0,
                        x
                    ];
                    break;
                default:
                    console.error("unknown color " + h + ' ' + s + " " + v);
                    break;
            }
            var m = v - c;
            rgb[0] += m;
            rgb[1] += m;
            rgb[2] += m;
            rgb[0] = Math.round(rgb[0] * 255);
            rgb[1] = Math.round(rgb[1] * 255);
            rgb[2] = Math.round(rgb[2] * 255);
            return {
                r: rgb[0],
                g: rgb[1],
                b: rgb[2]
            };
        },
        /**
         * http://en.wikipedia.org/wiki/HSL_and_HSV
         * @param {Number} r The red component (0-255).
         * @param {Number} g The green component (0-255).
         * @param {Number} b The blue component (0-255).
         * @return {Object} An object with "h", "s" and "v" color properties.
         */
        rgb2hsv: function(r, g, b) {
            r = r / 255;
            g = g / 255;
            b = b / 255;
            var M = Math.max(r, g, b);
            var m = Math.min(r, g, b);
            var c = M - m;
            var hprime = 0;
            if (c !== 0) {
                if (M === r) {
                    hprime = ((g - b) / c) % 6;
                } else if (M === g) {
                    hprime = ((b - r) / c) + 2;
                } else if (M === b) {
                    hprime = ((r - g) / c) + 4;
                }
            }
            var h = hprime * 60;
            if (h === 360) {
                h = 0;
            }
            var v = M;
            var s = 0;
            if (c !== 0) {
                s = c / v;
            }
            h = h / 360;
            if (h < 0) {
                h = h + 1;
            }
            return {
                h: h,
                s: s,
                v: v
            };
        },
        /**
         *
         * @param r
         * @param g
         * @param b
         * @return {String}
         */
        rgb2hex: function(r, g, b) {
            r = r.toString(16);
            g = g.toString(16);
            b = b.toString(16);
            if (r.length < 2) {
                r = '0' + r;
            }
            if (g.length < 2) {
                g = '0' + g;
            }
            if (b.length < 2) {
                b = '0' + b;
            }
            return (r + g + b).toUpperCase();
        },
        colorMap: {
            aliceblue: [
                240,
                248,
                255
            ],
            antiquewhite: [
                250,
                235,
                215
            ],
            aqua: [
                0,
                255,
                255
            ],
            aquamarine: [
                127,
                255,
                212
            ],
            azure: [
                240,
                255,
                255
            ],
            beige: [
                245,
                245,
                220
            ],
            bisque: [
                255,
                228,
                196
            ],
            black: [
                0,
                0,
                0
            ],
            blanchedalmond: [
                255,
                235,
                205
            ],
            blue: [
                0,
                0,
                255
            ],
            blueviolet: [
                138,
                43,
                226
            ],
            brown: [
                165,
                42,
                42
            ],
            burlywood: [
                222,
                184,
                135
            ],
            cadetblue: [
                95,
                158,
                160
            ],
            chartreuse: [
                127,
                255,
                0
            ],
            chocolate: [
                210,
                105,
                30
            ],
            coral: [
                255,
                127,
                80
            ],
            cornflowerblue: [
                100,
                149,
                237
            ],
            cornsilk: [
                255,
                248,
                220
            ],
            crimson: [
                220,
                20,
                60
            ],
            cyan: [
                0,
                255,
                255
            ],
            darkblue: [
                0,
                0,
                139
            ],
            darkcyan: [
                0,
                139,
                139
            ],
            darkgoldenrod: [
                184,
                132,
                11
            ],
            darkgray: [
                169,
                169,
                169
            ],
            darkgreen: [
                0,
                100,
                0
            ],
            darkgrey: [
                169,
                169,
                169
            ],
            darkkhaki: [
                189,
                183,
                107
            ],
            darkmagenta: [
                139,
                0,
                139
            ],
            darkolivegreen: [
                85,
                107,
                47
            ],
            darkorange: [
                255,
                140,
                0
            ],
            darkorchid: [
                153,
                50,
                204
            ],
            darkred: [
                139,
                0,
                0
            ],
            darksalmon: [
                233,
                150,
                122
            ],
            darkseagreen: [
                143,
                188,
                143
            ],
            darkslateblue: [
                72,
                61,
                139
            ],
            darkslategray: [
                47,
                79,
                79
            ],
            darkslategrey: [
                47,
                79,
                79
            ],
            darkturquoise: [
                0,
                206,
                209
            ],
            darkviolet: [
                148,
                0,
                211
            ],
            deeppink: [
                255,
                20,
                147
            ],
            deepskyblue: [
                0,
                191,
                255
            ],
            dimgray: [
                105,
                105,
                105
            ],
            dimgrey: [
                105,
                105,
                105
            ],
            dodgerblue: [
                30,
                144,
                255
            ],
            firebrick: [
                178,
                34,
                34
            ],
            floralwhite: [
                255,
                255,
                240
            ],
            forestgreen: [
                34,
                139,
                34
            ],
            fuchsia: [
                255,
                0,
                255
            ],
            gainsboro: [
                220,
                220,
                220
            ],
            ghostwhite: [
                248,
                248,
                255
            ],
            gold: [
                255,
                215,
                0
            ],
            goldenrod: [
                218,
                165,
                32
            ],
            gray: [
                128,
                128,
                128
            ],
            green: [
                0,
                128,
                0
            ],
            greenyellow: [
                173,
                255,
                47
            ],
            grey: [
                128,
                128,
                128
            ],
            honeydew: [
                240,
                255,
                240
            ],
            hotpink: [
                255,
                105,
                180
            ],
            indianred: [
                205,
                92,
                92
            ],
            indigo: [
                75,
                0,
                130
            ],
            ivory: [
                255,
                255,
                240
            ],
            khaki: [
                240,
                230,
                140
            ],
            lavender: [
                230,
                230,
                250
            ],
            lavenderblush: [
                255,
                240,
                245
            ],
            lawngreen: [
                124,
                252,
                0
            ],
            lemonchiffon: [
                255,
                250,
                205
            ],
            lightblue: [
                173,
                216,
                230
            ],
            lightcoral: [
                240,
                128,
                128
            ],
            lightcyan: [
                224,
                255,
                255
            ],
            lightgoldenrodyellow: [
                250,
                250,
                210
            ],
            lightgray: [
                211,
                211,
                211
            ],
            lightgreen: [
                144,
                238,
                144
            ],
            lightgrey: [
                211,
                211,
                211
            ],
            lightpink: [
                255,
                182,
                193
            ],
            lightsalmon: [
                255,
                160,
                122
            ],
            lightseagreen: [
                32,
                178,
                170
            ],
            lightskyblue: [
                135,
                206,
                250
            ],
            lightslategray: [
                119,
                136,
                153
            ],
            lightslategrey: [
                119,
                136,
                153
            ],
            lightsteelblue: [
                176,
                196,
                222
            ],
            lightyellow: [
                255,
                255,
                224
            ],
            lime: [
                0,
                255,
                0
            ],
            limegreen: [
                50,
                205,
                50
            ],
            linen: [
                250,
                240,
                230
            ],
            magenta: [
                255,
                0,
                255
            ],
            maroon: [
                128,
                0,
                0
            ],
            mediumaquamarine: [
                102,
                205,
                170
            ],
            mediumblue: [
                0,
                0,
                205
            ],
            mediumorchid: [
                186,
                85,
                211
            ],
            mediumpurple: [
                147,
                112,
                219
            ],
            mediumseagreen: [
                60,
                179,
                113
            ],
            mediumslateblue: [
                123,
                104,
                238
            ],
            mediumspringgreen: [
                0,
                250,
                154
            ],
            mediumturquoise: [
                72,
                209,
                204
            ],
            mediumvioletred: [
                199,
                21,
                133
            ],
            midnightblue: [
                25,
                25,
                112
            ],
            mintcream: [
                245,
                255,
                250
            ],
            mistyrose: [
                255,
                228,
                225
            ],
            moccasin: [
                255,
                228,
                181
            ],
            navajowhite: [
                255,
                222,
                173
            ],
            navy: [
                0,
                0,
                128
            ],
            oldlace: [
                253,
                245,
                230
            ],
            olive: [
                128,
                128,
                0
            ],
            olivedrab: [
                107,
                142,
                35
            ],
            orange: [
                255,
                165,
                0
            ],
            orangered: [
                255,
                69,
                0
            ],
            orchid: [
                218,
                112,
                214
            ],
            palegoldenrod: [
                238,
                232,
                170
            ],
            palegreen: [
                152,
                251,
                152
            ],
            paleturquoise: [
                175,
                238,
                238
            ],
            palevioletred: [
                219,
                112,
                147
            ],
            papayawhip: [
                255,
                239,
                213
            ],
            peachpuff: [
                255,
                218,
                185
            ],
            peru: [
                205,
                133,
                63
            ],
            pink: [
                255,
                192,
                203
            ],
            plum: [
                221,
                160,
                203
            ],
            powderblue: [
                176,
                224,
                230
            ],
            purple: [
                128,
                0,
                128
            ],
            red: [
                255,
                0,
                0
            ],
            rosybrown: [
                188,
                143,
                143
            ],
            royalblue: [
                65,
                105,
                225
            ],
            saddlebrown: [
                139,
                69,
                19
            ],
            salmon: [
                250,
                128,
                114
            ],
            sandybrown: [
                244,
                164,
                96
            ],
            seagreen: [
                46,
                139,
                87
            ],
            seashell: [
                255,
                245,
                238
            ],
            sienna: [
                160,
                82,
                45
            ],
            silver: [
                192,
                192,
                192
            ],
            skyblue: [
                135,
                206,
                235
            ],
            slateblue: [
                106,
                90,
                205
            ],
            slategray: [
                119,
                128,
                144
            ],
            slategrey: [
                119,
                128,
                144
            ],
            snow: [
                255,
                255,
                250
            ],
            springgreen: [
                0,
                255,
                127
            ],
            steelblue: [
                70,
                130,
                180
            ],
            tan: [
                210,
                180,
                140
            ],
            teal: [
                0,
                128,
                128
            ],
            thistle: [
                216,
                191,
                216
            ],
            tomato: [
                255,
                99,
                71
            ],
            turquoise: [
                64,
                224,
                208
            ],
            violet: [
                238,
                130,
                238
            ],
            wheat: [
                245,
                222,
                179
            ],
            white: [
                255,
                255,
                255
            ],
            whitesmoke: [
                245,
                245,
                245
            ],
            yellow: [
                255,
                255,
                0
            ],
            yellowgreen: [
                154,
                205,
                5
            ]
        }
    };
}, function(ColorUtils) {
    var formats = ColorUtils.formats,
        lowerized = {};
    formats['#HEX6'] = function(color) {
        return '#' + formats.HEX6(color);
    };
    formats['#HEX8'] = function(color) {
        return '#' + formats.HEX8(color);
    };
    Ext.Object.each(formats, function(name, fn) {
        lowerized[name.toLowerCase()] = function(color) {
            var ret = fn(color);
            return ret.toLowerCase();
        };
    });
    Ext.apply(formats, lowerized);
});

Ext.define('Ext.ux.colorpick.ColorMapController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.colorpickercolormapcontroller',
    requires: [
        'Ext.ux.colorpick.ColorUtils'
    ],
    // After the component is rendered
    onFirstBoxReady: function() {
        var me = this,
            colorMap = me.getView(),
            dragHandle = colorMap.down('#dragHandle'),
            dd = dragHandle.dd;
        // configure draggable constraints 
        dd.constrain = true;
        dd.constrainTo = colorMap.getEl();
        dd.initialConstrainTo = dd.constrainTo;
        // needed otheriwse error EXTJS-13187
        // event handlers
        dd.on('drag', Ext.bind(me.onHandleDrag, me));
        me.mon(colorMap.getEl(), {
            mousedown: me.onMouseDown,
            dragstart: me.onDragStart,
            scope: me
        });
    },
    // Fires when handle is dragged; propagates "handledrag" event on the ColorMap
    // with parameters "percentX" and "percentY", both 0-1, representing the handle
    // position on the color map, relative to the container
    onHandleDrag: function(componentDragger, e) {
        var me = this,
            container = me.getView(),
            // the Color Map
            dragHandle = container.down('#dragHandle'),
            x = dragHandle.getX() - container.getX(),
            y = dragHandle.getY() - container.getY(),
            containerEl = container.getEl(),
            containerWidth = containerEl.getWidth(),
            containerHeight = containerEl.getHeight(),
            xRatio = x / containerWidth,
            yRatio = y / containerHeight;
        // Adjust x/y ratios for dragger always being 1 pixel from the edge on the right
        if (xRatio > 0.99) {
            xRatio = 1;
        }
        if (yRatio > 0.99) {
            yRatio = 1;
        }
        container.fireEvent('handledrag', xRatio, yRatio);
    },
    // Whenever we mousedown over the colormap area
    onMouseDown: function(e) {
        var me = this,
            container = me.getView(),
            dragHandle = container.down('#dragHandle');
        // position drag handle accordingly
        dragHandle.setY(e.getY());
        dragHandle.setX(e.getX());
        me.onHandleDrag();
        // tie into the default dd mechanism
        dragHandle.dd.onMouseDown(e, dragHandle.dd.el);
    },
    // Whenever we start a drag over the colormap area
    onDragStart: function(e) {
        var me = this,
            container = me.getView(),
            dragHandle = container.down('#dragHandle');
        // tie into the default dd mechanism
        dragHandle.dd.onDragStart(e, dragHandle.dd.el);
    },
    // Whenever the map is clicked (but not the drag handle) we need to position
    // the drag handle to the point of click
    onMapClick: function(e) {
        var me = this,
            container = me.getView(),
            // the Color Map
            dragHandle = container.down('#dragHandle'),
            cXY = container.getXY(),
            eXY = e.getXY(),
            left, top;
        left = eXY[0] - cXY[0];
        top = eXY[1] - cXY[1];
        dragHandle.getEl().setStyle({
            left: left + 'px',
            top: top + 'px'
        });
        me.onHandleDrag();
    },
    // Whenever the underlying binding data is changed we need to 
    // update position of the dragger; active drag state has been
    // accounted for earlier
    onColorBindingChanged: function(selectedColor) {
        var me = this,
            vm = me.getViewModel(),
            rgba = vm.get('selectedColor'),
            hsv,
            container = me.getView(),
            // the Color Map
            dragHandle = container.down('#dragHandle'),
            containerEl = container.getEl(),
            containerWidth = containerEl.getWidth(),
            containerHeight = containerEl.getHeight(),
            xRatio, yRatio, left, top;
        // Color map selection really only depends on saturation and value of the color
        hsv = Ext.ux.colorpick.ColorUtils.rgb2hsv(rgba.r, rgba.g, rgba.b);
        // x-axis of color map with value 0-1 translates to saturation
        xRatio = hsv.s;
        left = containerWidth * xRatio;
        // y-axis of color map with value 0-1 translates to reverse of "value"
        yRatio = 1 - hsv.v;
        top = containerHeight * yRatio;
        // Position dragger
        dragHandle.getEl().setStyle({
            left: left + 'px',
            top: top + 'px'
        });
    },
    // Whenever only Hue changes we can update the 
    // background color of the color map
    // Param "hue" has value of 0-1
    onHueBindingChanged: function(hue) {
        var me = this,
            vm = me.getViewModel(),
            fullColorRGB, hex;
        fullColorRGB = Ext.ux.colorpick.ColorUtils.hsv2rgb(hue, 1, 1);
        hex = Ext.ux.colorpick.ColorUtils.rgb2hex(fullColorRGB.r, fullColorRGB.g, fullColorRGB.b);
        me.getView().getEl().applyStyles({
            'background-color': '#' + hex
        });
    }
});

/**
 * The main colorful square for selecting color shades by dragging around the
 * little circle.
 * @private
 */
Ext.define('Ext.ux.colorpick.ColorMap', {
    extend: 'Ext.container.Container',
    alias: 'widget.colorpickercolormap',
    controller: 'colorpickercolormapcontroller',
    requires: [
        'Ext.ux.colorpick.ColorMapController'
    ],
    cls: Ext.baseCSSPrefix + 'colorpicker-colormap',
    // This is the drag "circle"; note it's 1x1 in size to allow full
    // travel around the color map; the inner div has the bigger image
    items: [
        {
            xtype: 'component',
            cls: Ext.baseCSSPrefix + 'colorpicker-colormap-draghandle-container',
            itemId: 'dragHandle',
            width: 1,
            height: 1,
            draggable: true,
            html: '<div class="' + Ext.baseCSSPrefix + 'colorpicker-colormap-draghandle"></div>'
        }
    ],
    listeners: {
        boxready: {
            single: true,
            fn: 'onFirstBoxReady',
            scope: 'controller'
        },
        colorbindingchanged: {
            fn: 'onColorBindingChanged',
            scope: 'controller'
        },
        huebindingchanged: {
            fn: 'onHueBindingChanged',
            scope: 'controller'
        }
    },
    afterRender: function() {
        var me = this,
            src = me.mapGradientUrl,
            el = me.el;
        me.callParent();
        if (!src) {
            // We do this trick to allow the Sass to calculate resource image path for
            // our package and pick up the proper image URL here.
            src = el.getStyle('background-image');
            src = src.substring(4, src.length - 1);
            // strip off outer "url(...)"
            // In IE8 this path will have quotes around it
            if (src.indexOf('"') === 0) {
                src = src.substring(1, src.length - 1);
            }
            // Then remember it on our prototype for any subsequent instances.
            Ext.ux.colorpick.ColorMap.prototype.mapGradientUrl = src;
        }
        // Now clear that style because it will conflict with the background-color
        el.setStyle('background-image', 'none');
        // Create the image with transparent PNG with black and white gradient shades;
        // it blends with the background color (which changes with hue selection). This
        // must be an IMG in order to properly stretch to fit.
        el = me.layout.getElementTarget();
        // the el for items and html
        el.createChild({
            tag: 'img',
            cls: Ext.baseCSSPrefix + 'colorpicker-colormap-blender',
            src: src
        });
    },
    // Called via data binding whenever selectedColor changes; fires "colorbindingchanged"
    setPosition: function(data) {
        var me = this,
            dragHandle = me.down('#dragHandle');
        // Too early in the render cycle? Skip event
        if (!dragHandle.dd || !dragHandle.dd.constrain) {
            return;
        }
        // User actively dragging? Skip event
        if (typeof dragHandle.dd.dragEnded !== 'undefined' && !dragHandle.dd.dragEnded) {
            return;
        }
        me.fireEvent('colorbindingchanged', data);
    },
    // Called via data binding whenever selectedColor.h changes; fires "huebindingchanged" event
    setHue: function(hue) {
        var me = this;
        // Too early in the render cycle? Skip event
        if (!me.getEl()) {
            return;
        }
        me.fireEvent('huebindingchanged', hue);
    }
});

/**
 * View Model that holds the "selectedColor" of the color picker container.
 */
Ext.define('Ext.ux.colorpick.SelectorModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.colorpick-selectormodel',
    requires: [
        'Ext.ux.colorpick.ColorUtils'
    ],
    data: {
        selectedColor: {
            r: 255,
            // red
            g: 255,
            // green
            b: 255,
            // blue
            h: 0,
            // hue,
            s: 1,
            // saturation
            v: 1,
            // value
            a: 1
        },
        // alpha (opacity)
        previousColor: {
            r: 0,
            // red
            g: 0,
            // green
            b: 0,
            // blue
            h: 0,
            // hue,
            s: 1,
            // saturation
            v: 1,
            // value
            a: 1
        }
    },
    // alpha (opacity)
    formulas: {
        // Hexadecimal representation of the color
        hex: {
            get: function(get) {
                var r = get('selectedColor.r').toString(16),
                    g = get('selectedColor.g').toString(16),
                    b = get('selectedColor.b').toString(16),
                    result;
                result = Ext.ux.colorpick.ColorUtils.rgb2hex(r, g, b);
                return '#' + result;
            },
            set: function(hex) {
                var rgb = Ext.ux.colorpick.ColorUtils.hex2rgb(hex);
                this.changeRGB(rgb);
            }
        },
        // "R" in "RGB"
        red: {
            get: function(get) {
                return get('selectedColor.r');
            },
            set: function(r) {
                this.changeRGB({
                    r: r
                });
            }
        },
        // "G" in "RGB"
        green: {
            get: function(get) {
                return get('selectedColor.g');
            },
            set: function(g) {
                this.changeRGB({
                    g: g
                });
            }
        },
        // "B" in "RGB"
        blue: {
            get: function(get) {
                return get('selectedColor.b');
            },
            set: function(b) {
                this.changeRGB({
                    b: b
                });
            }
        },
        // "H" in HSV
        hue: {
            get: function(get) {
                return get('selectedColor.h') * 360;
            },
            set: function(hue) {
                this.changeHSV({
                    h: hue / 360
                });
            }
        },
        // "S" in HSV
        saturation: {
            get: function(get) {
                return get('selectedColor.s') * 100;
            },
            set: function(saturation) {
                this.changeHSV({
                    s: saturation / 100
                });
            }
        },
        // "V" in HSV
        value: {
            get: function(get) {
                var v = get('selectedColor.v');
                return v * 100;
            },
            set: function(value) {
                this.changeHSV({
                    v: value / 100
                });
            }
        },
        alpha: {
            get: function(data) {
                var a = data('selectedColor.a');
                return a * 100;
            },
            set: function(alpha) {
                this.set('selectedColor', Ext.applyIf({
                    a: alpha / 100
                }, this.data.selectedColor));
            }
        }
    },
    // formulas
    changeHSV: function(hsv) {
        Ext.applyIf(hsv, this.data.selectedColor);
        var rgb = Ext.ux.colorpick.ColorUtils.hsv2rgb(hsv.h, hsv.s, hsv.v);
        hsv.r = rgb.r;
        hsv.g = rgb.g;
        hsv.b = rgb.b;
        this.set('selectedColor', hsv);
    },
    changeRGB: function(rgb) {
        Ext.applyIf(rgb, this.data.selectedColor);
        var hsv = Ext.ux.colorpick.ColorUtils.rgb2hsv(rgb.r, rgb.g, rgb.b);
        rgb.h = hsv.h;
        rgb.s = hsv.s;
        rgb.v = hsv.v;
        this.set('selectedColor', rgb);
    }
});

Ext.define('Ext.ux.colorpick.SelectorController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.colorpick-selectorcontroller',
    requires: [
        'Ext.ux.colorpick.ColorUtils'
    ],
    initViewModel: function() {
        var me = this,
            view = me.getView();
        // And ensure that the
        view.childViewModel.bind('{selectedColor}', function(color) {
            view.setColor(color);
        });
    },
    destroy: function() {
        var me = this,
            view = me.getView(),
            childViewModel = view.childViewModel;
        if (childViewModel) {
            childViewModel.destroy();
            view.childViewModel = null;
        }
        me.callParent();
    },
    changeHSV: function(hsv) {
        var view = this.getView(),
            color = view.getColor(),
            rgb;
        // Put in values we are not changing (like A, but also missing HSV values)
        Ext.applyIf(hsv, color);
        // Now that HSV is complete, recalculate RGB and combine them
        rgb = Ext.ux.colorpick.ColorUtils.hsv2rgb(hsv.h, hsv.s, hsv.v);
        Ext.apply(hsv, rgb);
        view.setColor(hsv);
    },
    // Updates Saturation/Value in the model based on ColorMap; params:
    // xPercent - where is the handle relative to the color map width
    // yPercent - where is the handle relative to the color map height
    onColorMapHandleDrag: function(xPercent, yPercent) {
        this.changeHSV({
            s: xPercent,
            v: 1 - yPercent
        });
    },
    // Updates HSV Value in the model and downstream RGB settings
    onValueSliderHandleDrag: function(yPercent) {
        this.changeHSV({
            v: 1 - yPercent
        });
    },
    // Updates HSV Saturation in the model and downstream RGB settings
    onSaturationSliderHandleDrag: function(yPercent) {
        this.changeHSV({
            s: 1 - yPercent
        });
    },
    // Updates Hue in the model and downstream RGB settings
    onHueSliderHandleDrag: function(yPercent) {
        this.changeHSV({
            h: 1 - yPercent
        });
    },
    onAlphaSliderHandleDrag: function(yPercent) {
        var view = this.getView(),
            color = view.getColor(),
            newColor = Ext.applyIf({
                a: 1 - yPercent
            }, color);
        view.setColor(newColor);
        view.el.repaint();
    },
    onPreviousColorSelected: function(comp, color) {
        var view = this.getView();
        view.setColor(color);
    },
    onOK: function() {
        var me = this,
            view = me.getView();
        view.fireEvent('ok', view, view.getValue());
    },
    onCancel: function() {
        this.fireViewEvent('cancel', this.getView());
    },
    onResize: function() {
        var me = this,
            view = me.getView(),
            vm = view.childViewModel,
            refs = me.getReferences(),
            h, s, v, a;
        // Skip initial rendering resize
        if (!me.hasResizedOnce) {
            me.hasResizedOnce = true;
            return;
        }
        h = vm.get('hue');
        s = vm.get('saturation');
        v = vm.get('value');
        a = vm.get('alpha');
        console.log('h=' + h);
        // Reposition the colormap's & sliders' drag handles
        refs.colorMap.setPosition(vm.getData());
        refs.hueSlider.setHue(h);
        refs.satSlider.setSaturation(s);
        refs.valueSlider.setValue(v);
        refs.alphaSlider.setAlpha(a);
    }
});

/**
 * A basic component that changes background color, with considerations for opacity
 * support (checkered background image and IE8 support).
 */
Ext.define('Ext.ux.colorpick.ColorPreview', {
    extend: 'Ext.Component',
    alias: 'widget.colorpickercolorpreview',
    requires: [
        'Ext.util.Format'
    ],
    //hack to solve issue with IE, when applying a filter the click listener is not being fired.
    style: 'position: relative',
    html: '<div class="filter" style="height:100%; width:100%; position: absolute;"></div>' + '<a class="btn" style="height:100%; width:100%; position: absolute;"></a>',
    //eo hack
    cls: 'x-colorpreview',
    height: 256,
    onRender: function() {
        var me = this;
        me.callParent(arguments);
        me.mon(me.el.down('.btn'), 'click', me.onClick, me);
    },
    onClick: function() {
        this.fireEvent('click', this, this.color);
    },
    // Called via databinding - update background color whenever ViewModel changes
    setColor: function(color) {
        var me = this,
            el = me.getEl();
        // Too early in rendering cycle; skip
        if (!el) {
            return;
        }
        me.color = color;
        me.applyBgStyle(color);
    },
    bgStyleTpl: Ext.create('Ext.XTemplate', Ext.isIE && Ext.ieVersion < 10 ? 'filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0, startColorstr=\'#{hexAlpha}{hex}\', endColorstr=\'#{hexAlpha}{hex}\');' : /* IE6-9 */
    'background: {rgba};'),
    applyBgStyle: function(color) {
        var me = this,
            colorUtils = Ext.ux.colorpick.ColorUtils,
            el = me.getEl().down('.filter'),
            hex, alpha, rgba, bgStyle;
        hex = colorUtils.rgb2hex(color.r, color.g, color.b);
        alpha = Ext.util.Format.hex(Math.floor(color.a * 255), 2);
        rgba = colorUtils.getRGBAString(color);
        bgStyle = this.bgStyleTpl.apply({
            hex: hex,
            hexAlpha: alpha,
            rgba: rgba
        });
        el.applyStyles(bgStyle);
    }
});

Ext.define('Ext.ux.colorpick.SliderController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.colorpick-slidercontroller',
    // After the component is rendered
    boxReady: function(view) {
        var me = this,
            container = me.getDragContainer(),
            dragHandle = me.getDragHandle(),
            dd = dragHandle.dd;
        // configure draggable constraints 
        dd.constrain = true;
        dd.constrainTo = container.getEl();
        dd.initialConstrainTo = dd.constrainTo;
        // needed otheriwse error EXTJS-13187
        // event handlers
        dd.on('drag', me.onHandleDrag, me);
    },
    getDragHandle: function() {
        return this.view.lookupReference('dragHandle');
    },
    getDragContainer: function() {
        return this.view.lookupReference('dragHandleContainer');
    },
    // Fires when handle is dragged; fires "handledrag" event on the slider
    // with parameter  "percentY" 0-1, representing the handle position on the slider
    // relative to the height
    onHandleDrag: function(e) {
        var me = this,
            view = me.getView(),
            container = me.getDragContainer(),
            dragHandle = me.getDragHandle(),
            y = dragHandle.getY() - container.getY(),
            containerEl = container.getEl(),
            containerHeight = containerEl.getHeight(),
            yRatio = y / containerHeight;
        // Adjust y ratio for dragger always being 1 pixel from the edge on the bottom
        if (yRatio > 0.99) {
            yRatio = 1;
        }
        view.fireEvent('handledrag', yRatio);
    },
    // Whenever we mousedown over the slider area
    onMouseDown: function(e) {
        var me = this,
            dragHandle = me.getDragHandle(),
            y = e.getY();
        // position drag handle accordingly
        dragHandle.setY(y);
        me.onHandleDrag();
        dragHandle.el.repaint();
        // tie into the default dd mechanism
        dragHandle.dd.onMouseDown(e, dragHandle.dd.el);
    },
    // Whenever we start a drag over the colormap area
    onDragStart: function(e) {
        var me = this,
            dragHandle = me.getDragHandle();
        // tie into the default dd mechanism
        dragHandle.dd.onDragStart(e, dragHandle.dd.el);
    },
    onMouseUp: function() {
        var dragHandle = this.getDragHandle();
        dragHandle.dd.dragEnded = true;
    }
});

/**
 * Parent view for the 4 sliders seen on the color picker window.
 * @private
 */
Ext.define('Ext.ux.colorpick.Slider', {
    extend: 'Ext.container.Container',
    xtype: 'colorpickerslider',
    controller: 'colorpick-slidercontroller',
    baseCls: Ext.baseCSSPrefix + 'colorpicker-slider',
    layout: 'center',
    requires: [
        'Ext.layout.container.Center',
        'Ext.ux.colorpick.SliderController'
    ],
    referenceHolder: true,
    listeners: {
        element: 'el',
        mousedown: 'onMouseDown',
        mouseup: 'onMouseUp',
        dragstart: 'onDragStart'
    },
    // Container for the drag handle; needed since the slider
    // is of static size, while the parent container positions
    // it in the center; this is what receives the beautiful
    // color gradients for the visual
    items: {
        xtype: 'container',
        cls: Ext.baseCSSPrefix + 'colorpicker-draghandle-container',
        reference: 'dragHandleContainer',
        height: '100%',
        // This is the drag handle; note it's 100%x1 in size to allow full
        // vertical drag travel; the inner div has the bigger image
        items: {
            xtype: 'component',
            cls: Ext.baseCSSPrefix + 'colorpicker-draghandle-outer',
            reference: 'dragHandle',
            width: '100%',
            height: 1,
            draggable: true,
            html: '<div class="' + Ext.baseCSSPrefix + 'colorpicker-draghandle"></div>'
        }
    },
    // Called via data binding whenever selectedColor.h changes;
    setHue: function() {
        Ext.Error.raise('Must implement setHue() in a child class!');
    },
    getDragHandle: function() {
        return this.lookupReference('dragHandle');
    },
    getDragContainer: function() {
        return this.lookupReference('dragHandleContainer');
    }
});

/**
 * Used for "Alpha" slider.
 * @private
 */
Ext.define('Ext.ux.colorpick.SliderAlpha', {
    extend: 'Ext.ux.colorpick.Slider',
    alias: 'widget.colorpickerslideralpha',
    cls: Ext.baseCSSPrefix + 'colorpicker-alpha',
    requires: [
        'Ext.XTemplate'
    ],
    gradientStyleTpl: Ext.create('Ext.XTemplate', Ext.isIE && Ext.ieVersion < 10 ? 'filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0, startColorstr=\'#FF{hex}\', endColorstr=\'#00{hex}\');' : /* IE6-9 */
    'background: -mox-linear-gradient(top, rgba({r}, {g}, {b}, 1) 0%, rgba({r}, {g}, {b}, 0) 100%);' + /* FF3.6+ */
    'background: -webkit-linear-gradient(top,rgba({r}, {g}, {b}, 1) 0%, rgba({r}, {g}, {b}, 0) 100%);' + /* Chrome10+,Safari5.1+ */
    'background: -o-linear-gradient(top, rgba({r}, {g}, {b}, 1) 0%, rgba({r}, {g}, {b}, 0) 100%);' + /* Opera 11.10+ */
    'background: -ms-linear-gradient(top, rgba({r}, {g}, {b}, 1) 0%, rgba({r}, {g}, {b}, 0) 100%);' + /* IE10+ */
    'background: linear-gradient(to bottom, rgba({r}, {g}, {b}, 1) 0%, rgba({r}, {g}, {b}, 0) 100%);'),
    /* W3C */
    // Called via data binding whenever selectedColor.a changes; param is 0-100
    setAlpha: function(value) {
        var me = this,
            container = me.getDragContainer(),
            dragHandle = me.getDragHandle(),
            containerEl = container.getEl(),
            containerHeight = containerEl.getHeight(),
            el, top;
        // Too early in the render cycle? Skip event
        if (!dragHandle.dd || !dragHandle.dd.constrain) {
            return;
        }
        // User actively dragging? Skip event
        if (typeof dragHandle.dd.dragEnded !== 'undefined' && !dragHandle.dd.dragEnded) {
            return;
        }
        // y-axis of slider with value 0-1 translates to reverse of "value"
        top = containerHeight * (1 - (value / 100));
        // Position dragger
        el = dragHandle.getEl();
        el.setStyle({
            top: top
        });
    },
    // Called via data binding whenever selectedColor.h changes; hue param is 0-1
    setColor: function(color) {
        var me = this,
            container = me.getDragContainer(),
            hex, el;
        // Too early in the render cycle? Skip event
        if (!me.getEl()) {
            return;
        }
        // Determine HEX for new hue and set as background based on template
        hex = Ext.ux.colorpick.ColorUtils.rgb2hex(color.r, color.g, color.b);
        el = container.getEl().down('.x-autocontainer-innerCt');
        el.applyStyles(me.gradientStyleTpl.apply({
            hex: hex,
            r: color.r,
            g: color.g,
            b: color.b
        }));
    }
});

/**
 * Used for "Saturation" slider
 * @private
 */
Ext.define('Ext.ux.colorpick.SliderSaturation', {
    extend: 'Ext.ux.colorpick.Slider',
    alias: 'widget.colorpickerslidersaturation',
    cls: Ext.baseCSSPrefix + 'colorpicker-saturation',
    gradientStyleTpl: Ext.create('Ext.XTemplate', Ext.isIE && Ext.ieVersion < 10 ? 'filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0, startColorstr=\'#{hex}\', endColorstr=\'#ffffff\');' : /* IE6-9 */
    'background: -mox-linear-gradient(top, #{hex} 0%, #ffffff 100%);' + /* FF3.6+ */
    'background: -webkit-linear-gradient(top, #{hex} 0%,#ffffff 100%);' + /* Chrome10+,Safari5.1+ */
    'background: -o-linear-gradient(top, #{hex} 0%,#ffffff 100%);' + /* Opera 11.10+ */
    'background: -ms-linear-gradient(top, #{hex} 0%,#ffffff 100%);' + /* IE10+ */
    'background: linear-gradient(to bottom, #{hex} 0%,#ffffff 100%);'),
    /* W3C */
    // Called via data binding whenever selectedColor.s changes; saturation param is 0-100
    setSaturation: function(saturation) {
        var me = this,
            container = me.getDragContainer(),
            dragHandle = me.getDragHandle(),
            containerEl = container.getEl(),
            containerHeight = containerEl.getHeight(),
            yRatio, top;
        // Too early in the render cycle? Skip event
        if (!dragHandle.dd || !dragHandle.dd.constrain) {
            return;
        }
        // User actively dragging? Skip event
        if (typeof dragHandle.dd.dragEnded !== 'undefined' && !dragHandle.dd.dragEnded) {
            return;
        }
        // y-axis of slider with value 0-1 translates to reverse of "saturation"
        yRatio = 1 - (saturation / 100);
        top = containerHeight * yRatio;
        // Position dragger
        dragHandle.getEl().setStyle({
            top: top + 'px'
        });
    },
    // Called via data binding whenever selectedColor.h changes; hue param is 0-1
    setHue: function(hue) {
        var me = this,
            container = me.getDragContainer(),
            rgb, hex;
        // Too early in the render cycle? Skip event
        if (!me.getEl()) {
            return;
        }
        // Determine HEX for new hue and set as background based on template
        rgb = Ext.ux.colorpick.ColorUtils.hsv2rgb(hue, 1, 1);
        hex = Ext.ux.colorpick.ColorUtils.rgb2hex(rgb.r, rgb.g, rgb.b);
        container.getEl().applyStyles(me.gradientStyleTpl.apply({
            hex: hex
        }));
    }
});

/**
 * Used for "Value" slider.
 * @private
 */
Ext.define('Ext.ux.colorpick.SliderValue', {
    extend: 'Ext.ux.colorpick.Slider',
    alias: 'widget.colorpickerslidervalue',
    cls: Ext.baseCSSPrefix + 'colorpicker-value',
    requires: [
        'Ext.XTemplate'
    ],
    gradientStyleTpl: Ext.create('Ext.XTemplate', Ext.isIE && Ext.ieVersion < 10 ? 'filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0, startColorstr=\'#{hex}\', endColorstr=\'#000000\');' : /* IE6-9 */
    'background: -mox-linear-gradient(top, #{hex} 0%, #000000 100%);' + /* FF3.6+ */
    'background: -webkit-linear-gradient(top, #{hex} 0%,#000000 100%);' + /* Chrome10+,Safari5.1+ */
    'background: -o-linear-gradient(top, #{hex} 0%,#000000 100%);' + /* Opera 11.10+ */
    'background: -ms-linear-gradient(top, #{hex} 0%,#000000 100%);' + /* IE10+ */
    'background: linear-gradient(to bottom, #{hex} 0%,#000000 100%);'),
    /* W3C */
    // Called via data binding whenever selectedColor.v changes; value param is 0-100
    setValue: function(value) {
        var me = this,
            container = me.getDragContainer(),
            dragHandle = me.getDragHandle(),
            containerEl = container.getEl(),
            containerHeight = containerEl.getHeight(),
            yRatio, top;
        // Too early in the render cycle? Skip event
        if (!dragHandle.dd || !dragHandle.dd.constrain) {
            return;
        }
        // User actively dragging? Skip event
        if (typeof dragHandle.dd.dragEnded !== 'undefined' && !dragHandle.dd.dragEnded) {
            return;
        }
        // y-axis of slider with value 0-1 translates to reverse of "value"
        yRatio = 1 - (value / 100);
        top = containerHeight * yRatio;
        // Position dragger
        dragHandle.getEl().setStyle({
            top: top + 'px'
        });
    },
    // Called via data binding whenever selectedColor.h changes; hue param is 0-1
    setHue: function(hue) {
        var me = this,
            container = me.getDragContainer(),
            rgb, hex;
        // Too early in the render cycle? Skip event
        if (!me.getEl()) {
            return;
        }
        // Determine HEX for new hue and set as background based on template
        rgb = Ext.ux.colorpick.ColorUtils.hsv2rgb(hue, 1, 1);
        hex = Ext.ux.colorpick.ColorUtils.rgb2hex(rgb.r, rgb.g, rgb.b);
        container.getEl().applyStyles(me.gradientStyleTpl.apply({
            hex: hex
        }));
    }
});

/**
 * Used for "Hue" slider.
 * @private
 */
Ext.define('Ext.ux.colorpick.SliderHue', {
    extend: 'Ext.ux.colorpick.Slider',
    alias: 'widget.colorpickersliderhue',
    cls: Ext.baseCSSPrefix + 'colorpicker-hue',
    afterRender: function() {
        var me = this,
            src = me.gradientUrl,
            el = me.el;
        me.callParent();
        if (!src) {
            // We do this trick to allow the Sass to calculate resource image path for
            // our package and pick up the proper image URL here.
            src = el.getStyle('background-image');
            src = src.substring(4, src.length - 1);
            // strip off outer "url(...)"
            // In IE8 this path will have quotes around it
            if (src.indexOf('"') === 0) {
                src = src.substring(1, src.length - 1);
            }
            // Then remember it on our prototype for any subsequent instances.
            Ext.ux.colorpick.SliderHue.prototype.gradientUrl = src;
        }
        // Now clear that style because it will conflict with the background-color
        el.setStyle('background-image', 'none');
        // Create the image with the background PNG
        el = me.getDragContainer().layout.getElementTarget();
        // the el for items and html
        el.createChild({
            tag: 'img',
            cls: Ext.baseCSSPrefix + 'colorpicker-hue-gradient',
            src: src
        });
    },
    // Called via data binding whenever selectedColor.h changes; hue param is 0-1
    setHue: function(hue) {
        var me = this,
            container = me.getDragContainer(),
            dragHandle = me.getDragHandle(),
            containerEl = container.getEl(),
            containerHeight = containerEl.getHeight(),
            el, top;
        // Too early in the render cycle? Skip event
        if (!dragHandle.dd || !dragHandle.dd.constrain) {
            return;
        }
        // User actively dragging? Skip event
        if (typeof dragHandle.dd.dragEnded !== 'undefined' && !dragHandle.dd.dragEnded) {
            return;
        }
        // y-axis of slider with value 0-1 translates to reverse of "hue"
        top = containerHeight * (360 - hue) / 360;
        // Position dragger
        el = dragHandle.getEl();
        el.setStyle({
            top: top + 'px'
        });
    }
});

/**
 * Sencha Pro Services presents xtype "colorselector".
 * API has been kept as close to the regular colorpicker as possible. The Selector can be
 * rendered to any container.
 *
 * The defaul selected color is configurable via {@link #value} config. Usually used in
 * forms via {@link Ext.ux.colorpick.Button} or {@link Ext.ux.colorpick.Field}.
 *
 * Typically you will need to listen for the change event to be notified when the user
 * chooses a color. Alternatively, you can bind to the "value" config
 *
 *     @example
 *     Ext.create('Ext.ux.colorpick.Selector', {
 *         value     : '993300',  // initial selected color
 *         renderTo  : Ext.getBody(),
 *         listeners: {
 *             change: function (colorselector, color) {
 *                 console.log('New color: ' + color);
 *             }
 *         }
 *     });
 */
Ext.define('Ext.ux.colorpick.Selector', {
    extend: 'Ext.container.Container',
    xtype: 'colorselector',
    mixins: [
        'Ext.ux.colorpick.Selection'
    ],
    controller: 'colorpick-selectorcontroller',
    requires: [
        'Ext.layout.container.HBox',
        'Ext.form.field.Text',
        'Ext.form.field.Number',
        'Ext.ux.colorpick.ColorMap',
        'Ext.ux.colorpick.SelectorModel',
        'Ext.ux.colorpick.SelectorController',
        'Ext.ux.colorpick.ColorPreview',
        'Ext.ux.colorpick.Slider',
        'Ext.ux.colorpick.SliderAlpha',
        'Ext.ux.colorpick.SliderSaturation',
        'Ext.ux.colorpick.SliderValue',
        'Ext.ux.colorpick.SliderHue'
    ],
    width: 580,
    // default width and height gives 255x255 color map in Crisp
    height: 337,
    cls: Ext.baseCSSPrefix + 'colorpicker',
    padding: 10,
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    defaultBindProperty: 'value',
    twoWayBindable: [
        'value'
    ],
    /**
     * @cfg fieldWidth {Number} Width of the text fields on the container (excluding HEX);
     * since the width of the slider containers is the same as the text field under it 
     * (it's the same vbox column), changing this value will also affect the spacing between
     * the sliders.
     */
    fieldWidth: 50,
    /**
     * @cfg fieldPad {Number} padding between the sliders and HEX/R/G/B fields.
     */
    fieldPad: 5,
    /**
     * @cfg {Boolean} [showPreviousColor]
     * Whether "previous color" region (in upper right, below the selected color preview) should be shown;
     * these are relied upon by the {@link Ext.ux.colorpick.Button} and the {@link Ext.ux.colorpick.Field}.
     */
    showPreviousColor: false,
    /**
     * @cfg {Boolean} [showOkCancelButtons]
     * Whether Ok and Cancel buttons (in upper right, below the selected color preview) should be shown;
     * these are relied upon by the {@link Ext.ux.colorpick.Button} and the {@link Ext.ux.colorpick.Field}.
     */
    showOkCancelButtons: false,
    /**
     * @event change
     * Fires when a color is selected. Simply dragging sliders around will trigger this.
     * @param {Ext.ux.colorpick.Selector} this
     * @param {String} color The value of the selected color as per specified {@link #format}.
     * @param {String} previousColor The previous color value.
     */
    /**
     * @event ok
     * Fires when OK button is clicked (see {@link #showOkCancelButtons}).
     * @param {Ext.ux.colorpick.Selector} this
     * @param {String} color The value of the selected color as per specified {@link #format}.
     */
    /**
     * @event cancel
     * Fires when Cancel button is clicked (see {@link #showOkCancelButtons}).
     * @param {Ext.ux.colorpick.Selector} this
     */
    listeners: {
        resize: 'onResize'
    },
    constructor: function(config) {
        var me = this,
            childViewModel = Ext.Factory.viewModel('colorpick-selectormodel');
        // Since this component needs to present its value as a thing to which users can
        // bind, we create an internal VM for our purposes.
        me.childViewModel = childViewModel;
        me.items = [
            me.getMapAndHexRGBFields(childViewModel),
            me.getSliderAndHField(childViewModel),
            me.getSliderAndSField(childViewModel),
            me.getSliderAndVField(childViewModel),
            me.getSliderAndAField(childViewModel),
            me.getPreviewAndButtons(childViewModel, config)
        ];
        me.callParent(arguments);
    },
    updateColor: function(color) {
        var me = this;
        me.mixins.colorselection.updateColor.call(me, color);
        me.childViewModel.set('selectedColor', color);
    },
    updatePreviousColor: function(color) {
        this.childViewModel.set('previousColor', color);
    },
    // Splits up view declaration for readability
    // "Map" and HEX/R/G/B fields
    getMapAndHexRGBFields: function(childViewModel) {
        var me = this,
            fieldMargin = {
                top: 0,
                right: me.fieldPad,
                bottom: 0,
                left: 0
            },
            fieldWidth = me.fieldWidth;
        return {
            xtype: 'container',
            viewModel: childViewModel,
            cls: Ext.baseCSSPrefix + 'colorpicker-escape-overflow',
            flex: 1,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            margin: '0 10 0 0',
            items: [
                // "MAP"
                {
                    xtype: 'colorpickercolormap',
                    reference: 'colorMap',
                    flex: 1,
                    bind: {
                        position: {
                            bindTo: '{selectedColor}',
                            deep: true
                        },
                        hue: '{selectedColor.h}'
                    },
                    listeners: {
                        handledrag: 'onColorMapHandleDrag'
                    }
                },
                // HEX/R/G/B FIELDS
                {
                    xtype: 'container',
                    layout: 'hbox',
                    defaults: {
                        labelAlign: 'top',
                        labelSeparator: '',
                        allowBlank: false,
                        onChange: function() {
                            // prevent data binding propagation if bad value
                            if (this.isValid()) {
                                // this is kind of dirty and ideally we would extend these fields
                                // and override the method, but works for now
                                Ext.form.field.Base.prototype.onChange.apply(this, arguments);
                            }
                        }
                    },
                    items: [
                        {
                            xtype: 'textfield',
                            fieldLabel: 'HEX',
                            flex: 1,
                            bind: '{hex}',
                            margin: fieldMargin,
                            readOnly: true
                        },
                        {
                            xtype: 'numberfield',
                            fieldLabel: 'R',
                            bind: '{red}',
                            width: fieldWidth,
                            hideTrigger: true,
                            maxValue: 255,
                            minValue: 0,
                            margin: fieldMargin
                        },
                        {
                            xtype: 'numberfield',
                            fieldLabel: 'G',
                            bind: '{green}',
                            width: fieldWidth,
                            hideTrigger: true,
                            maxValue: 255,
                            minValue: 0,
                            margin: fieldMargin
                        },
                        {
                            xtype: 'numberfield',
                            fieldLabel: 'B',
                            bind: '{blue}',
                            width: fieldWidth,
                            hideTrigger: true,
                            maxValue: 255,
                            minValue: 0,
                            margin: 0
                        }
                    ]
                }
            ]
        };
    },
    // Splits up view declaration for readability
    // Slider and H field 
    getSliderAndHField: function(childViewModel) {
        var me = this;
        return {
            xtype: 'container',
            viewModel: childViewModel,
            cls: Ext.baseCSSPrefix + 'colorpicker-escape-overflow',
            width: me.fieldWidth,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'colorpickersliderhue',
                    reference: 'hueSlider',
                    flex: 1,
                    bind: {
                        hue: '{selectedColor.h}'
                    },
                    listeners: {
                        handledrag: 'onHueSliderHandleDrag'
                    }
                },
                {
                    xtype: 'numberfield',
                    fieldLabel: 'H',
                    labelAlign: 'top',
                    width: me.fieldWidth,
                    labelSeparator: '',
                    bind: '{hue}',
                    hideTrigger: true,
                    maxValue: 360,
                    minValue: 0,
                    allowBlank: false,
                    margin: 0
                }
            ]
        };
    },
    // Splits up view declaration for readability
    // Slider and S field 
    getSliderAndSField: function(childViewModel) {
        var me = this;
        return {
            xtype: 'container',
            viewModel: childViewModel,
            cls: Ext.baseCSSPrefix + 'colorpicker-escape-overflow',
            width: me.fieldWidth,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            margin: {
                right: me.fieldPad,
                left: me.fieldPad
            },
            items: [
                {
                    xtype: 'colorpickerslidersaturation',
                    reference: 'satSlider',
                    flex: 1,
                    bind: {
                        saturation: '{saturation}',
                        hue: '{selectedColor.h}'
                    },
                    listeners: {
                        handledrag: 'onSaturationSliderHandleDrag'
                    }
                },
                {
                    xtype: 'numberfield',
                    fieldLabel: 'S',
                    labelAlign: 'top',
                    labelSeparator: '',
                    bind: '{saturation}',
                    hideTrigger: true,
                    maxValue: 100,
                    minValue: 0,
                    allowBlank: false,
                    margin: 0
                }
            ]
        };
    },
    // Splits up view declaration for readability
    // Slider and V field 
    getSliderAndVField: function(childViewModel) {
        var me = this;
        return {
            xtype: 'container',
            viewModel: childViewModel,
            cls: Ext.baseCSSPrefix + 'colorpicker-escape-overflow',
            width: me.fieldWidth,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'colorpickerslidervalue',
                    reference: 'valueSlider',
                    flex: 1,
                    bind: {
                        value: '{value}',
                        hue: '{selectedColor.h}'
                    },
                    listeners: {
                        handledrag: 'onValueSliderHandleDrag'
                    }
                },
                {
                    xtype: 'numberfield',
                    fieldLabel: 'V',
                    labelAlign: 'top',
                    labelSeparator: '',
                    bind: '{value}',
                    hideTrigger: true,
                    maxValue: 100,
                    minValue: 0,
                    allowBlank: false,
                    margin: 0
                }
            ]
        };
    },
    // Splits up view declaration for readability
    // Slider and A field 
    getSliderAndAField: function(childViewModel) {
        var me = this;
        return {
            xtype: 'container',
            viewModel: childViewModel,
            cls: Ext.baseCSSPrefix + 'colorpicker-escape-overflow',
            width: me.fieldWidth,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            margin: {
                left: me.fieldPad
            },
            items: [
                {
                    xtype: 'colorpickerslideralpha',
                    reference: 'alphaSlider',
                    flex: 1,
                    bind: {
                        alpha: '{alpha}',
                        color: {
                            bindTo: '{selectedColor}',
                            deep: true
                        }
                    },
                    listeners: {
                        handledrag: 'onAlphaSliderHandleDrag'
                    }
                },
                {
                    xtype: 'numberfield',
                    fieldLabel: 'A',
                    labelAlign: 'top',
                    labelSeparator: '',
                    bind: '{alpha}',
                    hideTrigger: true,
                    maxValue: 100,
                    minValue: 0,
                    allowBlank: false,
                    margin: 0
                }
            ]
        };
    },
    // Splits up view declaration for readability
    // Preview current/previous color squares and OK and Cancel buttons
    getPreviewAndButtons: function(childViewModel, config) {
        // selected color preview is always shown
        var items = [
                {
                    xtype: 'colorpickercolorpreview',
                    flex: 1,
                    bind: {
                        color: {
                            bindTo: '{selectedColor}',
                            deep: true
                        }
                    }
                }
            ];
        // previous color preview is optional
        if (config.showPreviousColor) {
            items.push({
                xtype: 'colorpickercolorpreview',
                flex: 1,
                bind: {
                    color: {
                        bindTo: '{previousColor}',
                        deep: true
                    }
                },
                listeners: {
                    click: 'onPreviousColorSelected'
                }
            });
        }
        // Ok/Cancel buttons are optional
        if (config.showOkCancelButtons) {
            items.push({
                xtype: 'button',
                text: 'OK',
                margin: '10 0 0 0',
                handler: 'onOK'
            }, {
                xtype: 'button',
                text: 'Cancel',
                margin: '10 0 0 0',
                handler: 'onCancel'
            });
        }
        return {
            xtype: 'container',
            viewModel: childViewModel,
            width: 70,
            margin: '0 0 0 10',
            items: items,
            layout: {
                type: 'vbox',
                align: 'stretch'
            }
        };
    }
});

Ext.define('Ext.ux.colorpick.ButtonController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.colorpick-buttoncontroller',
    requires: [
        'Ext.window.Window',
        'Ext.layout.container.Fit',
        'Ext.ux.colorpick.Selector',
        'Ext.ux.colorpick.ColorUtils'
    ],
    afterRender: function(view) {
        view.updateColor(view.getColor());
    },
    destroy: function() {
        var view = this.getView(),
            colorPickerWindow = view.colorPickerWindow;
        if (colorPickerWindow) {
            colorPickerWindow.destroy();
            view.colorPickerWindow = view.colorPicker = null;
        }
        this.callParent();
    },
    getPopup: function() {
        var view = this.getView(),
            popup = view.colorPickerWindow,
            selector;
        if (!popup) {
            popup = Ext.create(view.getPopup());
            view.colorPickerWindow = popup;
            popup.colorPicker = view.colorPicker = selector = popup.lookupReference('selector');
            selector.setFormat(view.getFormat());
            selector.on({
                ok: 'onColorPickerOK',
                cancel: 'onColorPickerCancel',
                scope: this
            });
        }
        return popup;
    },
    // When button is clicked show the color picker window
    onClick: function() {
        var me = this,
            view = me.getView(),
            color = view.getColor(),
            popup = me.getPopup(),
            colorPicker = popup.colorPicker;
        colorPicker.setColor(color);
        colorPicker.setPreviousColor(color);
        popup.showBy(view, 'tl-br?');
    },
    onColorPickerOK: function(picker) {
        var view = this.getView(),
            color = picker.getColor(),
            cpWin = view.colorPickerWindow;
        cpWin.hide();
        view.setColor(color);
    },
    onColorPickerCancel: function() {
        var view = this.getView(),
            cpWin = view.colorPickerWindow;
        cpWin.hide();
    },
    syncColor: function(color) {
        var view = this.getView();
        Ext.ux.colorpick.ColorUtils.setBackground(view.filterEl, color);
    }
});

/**
 * A simple color swatch that can be clicked to bring up the color selector.
 *
 * The selected color is configurable via {@link #value}.
 *
 *     @example
 *     Ext.create('Ext.ux.colorpick.Button', {
 *         value: '993300',  // initial selected color
 *         renderTo: Ext.getBody(),
 *
 *         listeners: {
 *             select: function(picker, selColor) {
 *                 Ext.Msg.alert('Color', selColor);
 *             }
 *         }
 *     });
 */
Ext.define('Ext.ux.colorpick.Button', {
    extend: 'Ext.Component',
    xtype: 'colorbutton',
    controller: 'colorpick-buttoncontroller',
    mixins: [
        'Ext.ux.colorpick.Selection'
    ],
    requires: [
        'Ext.ux.colorpick.ButtonController'
    ],
    baseCls: Ext.baseCSSPrefix + 'colorpicker-button',
    width: 20,
    height: 20,
    childEls: [
        'btnEl',
        'filterEl'
    ],
    config: {
        /**
         * @cfg {Object} popup
         * This object configures the popup window and colorselector component displayed
         * when this button is clicked. Applications should not need to configure this.
         * @private
         */
        popup: {
            lazy: true,
            $value: {
                xtype: 'window',
                referenceHolder: true,
                minWidth: 540,
                minHeight: 200,
                layout: 'fit',
                header: false,
                resizable: true,
                items: {
                    xtype: 'colorselector',
                    reference: 'selector',
                    showPreviousColor: true,
                    showOkCancelButtons: true
                }
            }
        }
    },
    defaultBindProperty: 'value',
    twoWayBindable: 'value',
    // Solve issue with IE, when applying a filter the click listener is not being fired.
    renderTpl: '<div id="{id}-filterEl" data-ref="filterEl" style="height:100%; width:100%; position: absolute;"></div>' + '<a id="{id}-btnEl" data-ref="btnEl" style="height:100%; width:100%; position: absolute;"></a>',
    listeners: {
        click: 'onClick',
        element: 'btnEl'
    },
    /**
     * @event change
     * Fires when a color is selected.
     * @param {Ext.ux.colorpick.Selector} this
     * @param {String} color The value of the selected color as per specified {@link #format}.
     * @param {String} previousColor The previous color value.
     */
    updateColor: function(color) {
        var me = this,
            cp = me.colorPicker;
        me.mixins.colorselection.updateColor.call(me, color);
        Ext.ux.colorpick.ColorUtils.setBackground(me.filterEl, color);
        if (cp) {
            cp.setColor(color);
        }
    },
    // Sets this.format and color picker's setFormat()
    updateFormat: function(format) {
        var cp = this.colorPicker;
        if (cp) {
            cp.setFormat(format);
        }
    }
});

/**
 * A field that can be clicked to bring up the color picker.
 * The selected color is configurable via {@link #value}.
 *
 *      @example
 *      Ext.create({
 *          xtype: 'colorfield',
 *          renderTo: Ext.getBody(),
 *
 *          value: '#993300',  // initial selected color
 *
 *          listeners : {
 *              change: function (field, color) {
 *                  console.log('New color: ' + color);
 *              }
 *          }
 *      });
 */
Ext.define('Ext.ux.colorpick.Field', {
    extend: 'Ext.form.field.Picker',
    xtype: 'colorfield',
    mixins: [
        'Ext.ux.colorpick.Selection'
    ],
    requires: [
        'Ext.window.Window',
        'Ext.ux.colorpick.Selector',
        'Ext.ux.colorpick.ColorUtils',
        'Ext.layout.container.Fit'
    ],
    editable: false,
    matchFieldWidth: false,
    // picker is usually wider than field
    // "Color Swatch" shown on the left of the field
    beforeBodyEl: [
        '<div class="' + Ext.baseCSSPrefix + 'colorpicker-field-swatch">' + '<div id="{id}-swatchEl" data-ref="swatchEl" class="' + Ext.baseCSSPrefix + 'colorpicker-field-swatch-inner"></div>' + '</div>'
    ],
    cls: Ext.baseCSSPrefix + 'colorpicker-field',
    childEls: [
        'swatchEl'
    ],
    config: {
        /**
         * @cfg {Object} popup
         * This object configures the popup window and colorselector component displayed
         * when this button is clicked. Applications should not need to configure this.
         * @private
         */
        popup: {
            lazy: true,
            $value: {
                xtype: 'window',
                referenceHolder: true,
                minWidth: 540,
                minHeight: 200,
                layout: 'fit',
                header: false,
                resizable: true,
                items: {
                    xtype: 'colorselector',
                    reference: 'selector',
                    showPreviousColor: true,
                    showOkCancelButtons: true
                }
            }
        }
    },
    /**
     * @event change
     * Fires when a color is selected.
     * @param {Ext.ux.colorpick.Field} this
     * @param {String} color The value of the selected color as per specified {@link #format}.
     * @param {String} previousColor The previous color value.
     */
    // NOTE: Since much of the logic of a picker class is overriding methods from the
    // base class, we don't bother to split out the small remainder as a controller.
    afterRender: function() {
        this.callParent();
        this.updateValue(this.value);
    },
    // override as required by parent pickerfield
    createPicker: function() {
        var me = this,
            popup = me.getPopup(),
            picker;
        // the window will actually be shown and will house the picker
        me.colorPickerWindow = popup = Ext.create(popup);
        me.colorPicker = picker = popup.lookupReference('selector');
        picker.setFormat(me.getFormat());
        picker.setColor(me.getColor());
        picker.on({
            ok: 'onColorPickerOK',
            cancel: 'onColorPickerCancel',
            scope: me
        });
        return me.colorPickerWindow;
    },
    // When the Ok button is clicked on color picker, preserve the previous value
    onColorPickerOK: function(colorPicker) {
        this.setColor(colorPicker.getColor());
        this.collapse();
    },
    onColorPickerCancel: function() {
        this.collapse();
    },
    onExpand: function() {
        var color = this.getColor();
        this.colorPicker.setPreviousColor(color);
    },
    // Expects value formatted as per "format" config
    setValue: function(color) {
        var me = this,
            c = me.applyValue(color);
        me.callParent([
            c
        ]);
        // always update in case opacity changes, even if value doesn't have it
        // to handle "hex6" non-opacity type of format
        me.updateValue(c);
    },
    // Sets this.format and color picker's setFormat()
    updateFormat: function(format) {
        var cp = this.colorPicker;
        if (cp) {
            cp.setFormat(format);
        }
    },
    updateValue: function(color) {
        var me = this,
            c;
        // If the "value" is changed, update "color" as well. Since these are always
        // tracking each other, we guard against the case where we are being updated
        // *because* "color" is being set.
        if (!me.syncing) {
            me.syncing = true;
            me.setColor(color);
            me.syncing = false;
        }
        c = me.getColor();
        Ext.ux.colorpick.ColorUtils.setBackground(me.swatchEl, c);
        if (me.colorPicker) {
            me.colorPicker.setColor(c);
        }
    }
});

/**
 * A ratings picker based on `Ext.Widget`.
 *
 *      @example
 *      Ext.create({
 *          xtype: 'rating',
 *          renderTo: Ext.getBody(),
 *          listeners: {
 *              change: function (picker, value) {
 *                 console.log('Rating ' + value);
 *              }
 *          }
 *      });
 */
Ext.define('Ext.ux.rating.Picker', {
    extend: 'Ext.Widget',
    xtype: 'rating',
    focusable: true,
    /*
     * The "cachedConfig" block is basically the same as "config" except that these
     * values are applied specially to the first instance of the class. After processing
     * these configs, the resulting values are stored on the class `prototype` and the
     * template DOM element also reflects these default values.
     */
    cachedConfig: {
        /**
         * @cfg {String} [family]
         * The CSS `font-family` to use for displaying the `{@link #glyphs}`.
         */
        family: 'monospace',
        /**
         * @cfg {String/String[]/Number[]} [glyphs]
         * Either a string containing the two glyph characters, or an array of two strings
         * containing the individual glyph characters or an array of two numbers with the
         * character codes for the individual glyphs.
         *
         * For example:
         *
         *      @example
         *      Ext.create({
         *          xtype: 'rating',
         *          renderTo: Ext.getBody(),
         *          glyphs: [ 9671, 9670 ], // '◇◆',
         *          listeners: {
         *              change: function (picker, value) {
         *                 console.log('Rating ' + value);
         *              }
         *          }
         *      });
         */
        glyphs: '☆★',
        /**
         * @cfg {Number} [minimum=1]
         * The minimum allowed `{@link #value}` (rating).
         */
        minimum: 1,
        /**
         * @cfg {Number} [limit=1]
         * The maximum allowed `{@link #value}` (rating).
         */
        limit: 5,
        /**
         * @cfg {String/Object} [overStyle]
         * Optional styles to apply to the rating glyphs when `{@link #trackOver}` is
         * enabled.
         */
        overStyle: null,
        /**
         * @cfg {Number} [rounding=1]
         * The rounding to apply to values. Common choices are 0.5 (for half-steps) or
         * 0.25 (for quarter steps).
         */
        rounding: 1,
        /**
         * @cfg {String} [scale="125%"]
         * The CSS `font-size` to apply to the glyphs. This value defaults to 125% because
         * glyphs in the stock font tend to be too small. When using specially designed
         * "icon fonts" you may want to set this to 100%.
         */
        scale: '125%',
        /**
         * @cfg {String/Object} [selectedStyle]
         * Optional styles to apply to the rating value glyphs.
         */
        selectedStyle: null,
        /**
         * @cfg {String/Object} [style]
         * Optional styles to apply to the top-level element.
         */
        style: null,
        /**
         * @cfg {Object/String/String[]/Ext.XTemplate/Function} tooltip
         * A template or a function that produces the tooltip text. The `Object`, `String`
         * and `String[]` forms are converted to an `Ext.XTemplate`. If a function is given,
         * it will be called with an object parameter and should return the tooltip text.
         * The object contains these properties:
         *
         *   - component: The rating component requesting the tooltip.
         *   - tracking: The current value under the mouse cursor.
         *   - trackOver: The value of the `{@link #trackOver}` config.
         *   - value: The current value.
         *
         * Templates can use these properties to generate the proper text.
         */
        tooltip: null,
        /**
         * @cfg {Boolean} [trackOver=true]
         * Determines if mouse movements should temporarily update the displayed value.
         * The actual `value` is only updated on `click` but this rather acts as the
         * "preview" of the value prior to click.
         */
        trackOver: true,
        /**
         * @cfg {Number} value
         * The rating value. This value is bounded by `minimum` and `limit` and is also
         * adjusted by the `rounding`.
         */
        value: null,
        //---------------------------------------------------------------------
        // Private configs
        /**
         * @cfg {String} tooltipText
         * The current tooltip text. This value is set into the DOM by the updater (hence
         * only when it changes). This is intended for use by the tip manager
         * (`{@link Ext.tip.QuickTipManager}`). Developers should never need to set this
         * config since it is handled by virtue of setting other configs (such as the
         * {@link #tooltip} or the {@link #value}.).
         * @private
         */
        tooltipText: null,
        /**
         * @cfg {Number} trackingValue
         * This config is used to when `trackOver` is `true` and represents the tracked
         * value. This config is maintained by our `mousemove` handler. This should not
         * need to be set directly by user code.
         * @private
         */
        trackingValue: null
    },
    config: {
        /**
         * @cfg {Boolean/Object} [animate=false]
         * Specifies an animation to use when changing the `{@link #value}`. When setting
         * this config, it is probably best to set `{@link #trackOver}` to `false`.
         */
        animate: null
    },
    // This object describes our element tree from the root.
    element: {
        cls: 'u' + Ext.baseCSSPrefix + 'rating-picker',
        // Since we are replacing the entire "element" tree, we have to assign this
        // "reference" as would our base class.
        reference: 'element',
        children: [
            {
                reference: 'innerEl',
                cls: 'u' + Ext.baseCSSPrefix + 'rating-picker-inner',
                listeners: {
                    click: 'onClick',
                    mousemove: 'onMouseMove',
                    mouseenter: 'onMouseEnter',
                    mouseleave: 'onMouseLeave'
                },
                children: [
                    {
                        reference: 'valueEl',
                        cls: 'u' + Ext.baseCSSPrefix + 'rating-picker-value'
                    },
                    {
                        reference: 'trackerEl',
                        cls: 'u' + Ext.baseCSSPrefix + 'rating-picker-tracker'
                    }
                ]
            }
        ]
    },
    // Tell the Binding system to default to our "value" config.
    defaultBindProperty: 'value',
    // Enable two-way data binding for the "value" config.
    twoWayBindable: 'value',
    overCls: 'u' + Ext.baseCSSPrefix + 'rating-picker-over',
    trackOverCls: 'u' + Ext.baseCSSPrefix + 'rating-picker-track-over',
    //-------------------------------------------------------------------------
    // Config Appliers
    applyGlyphs: function(value) {
        if (typeof value === 'string') {
            if (value.length !== 2) {
                Ext.Error.raise('Expected 2 characters for "glyphs" not "' + value + '".');
            }
            value = [
                value.charAt(0),
                value.charAt(1)
            ];
        } else if (typeof value[0] === 'number') {
            value = [
                String.fromCharCode(value[0]),
                String.fromCharCode(value[1])
            ];
        }
        return value;
    },
    applyOverStyle: function(style) {
        this.trackerEl.applyStyles(style);
    },
    applySelectedStyle: function(style) {
        this.valueEl.applyStyles(style);
    },
    applyStyle: function(style) {
        this.element.applyStyles(style);
    },
    applyTooltip: function(tip) {
        if (tip && typeof tip !== 'function') {
            if (!tip.isTemplate) {
                tip = new Ext.XTemplate(tip);
            }
            tip = tip.apply.bind(tip);
        }
        return tip;
    },
    applyTrackingValue: function(value) {
        return this.applyValue(value);
    },
    // same rounding as normal value
    applyValue: function(v) {
        if (v !== null) {
            var rounding = this.getRounding(),
                limit = this.getLimit(),
                min = this.getMinimum();
            v = Math.round(Math.round(v / rounding) * rounding * 1000) / 1000;
            v = (v < min) ? min : (v > limit ? limit : v);
        }
        return v;
    },
    //-------------------------------------------------------------------------
    // Event Handlers
    onClick: function(event) {
        var value = this.valueFromEvent(event);
        this.setValue(value);
    },
    onMouseEnter: function() {
        this.element.addCls(this.overCls);
    },
    onMouseLeave: function() {
        this.element.removeCls(this.overCls);
    },
    onMouseMove: function(event) {
        var value = this.valueFromEvent(event);
        this.setTrackingValue(value);
    },
    //-------------------------------------------------------------------------
    // Config Updaters
    updateFamily: function(family) {
        this.element.setStyle('fontFamily', "'" + family + "'");
    },
    updateGlyphs: function() {
        this.refreshGlyphs();
    },
    updateLimit: function() {
        this.refreshGlyphs();
    },
    updateScale: function(size) {
        this.element.setStyle('fontSize', size);
    },
    updateTooltip: function() {
        this.refreshTooltip();
    },
    updateTooltipText: function(text) {
        var innerEl = this.innerEl,
            QuickTips = Ext.tip && Ext.tip.QuickTipManager,
            tip = QuickTips && QuickTips.tip,
            target;
        if (QuickTips) {
            innerEl.dom.setAttribute('data-qtip', text);
            this.trackerEl.dom.setAttribute('data-qtip', text);
            // If the QuickTipManager is active over our widget, we need to update
            // the tooltip text directly.
            target = tip && tip.activeTarget;
            target = target && target.el;
            if (target && innerEl.contains(target)) {
                tip.update(text);
            }
        }
    },
    updateTrackingValue: function(value) {
        var me = this,
            trackerEl = me.trackerEl,
            newWidth = me.valueToPercent(value);
        trackerEl.setStyle('width', newWidth);
        me.refreshTooltip();
    },
    updateTrackOver: function(trackOver) {
        this.element[trackOver ? 'addCls' : 'removeCls'](this.trackOverCls);
    },
    updateValue: function(value, oldValue) {
        var me = this,
            animate = me.getAnimate(),
            valueEl = me.valueEl,
            newWidth = me.valueToPercent(value),
            column, record;
        if (me.isConfiguring || !animate) {
            valueEl.setStyle('width', newWidth);
        } else {
            valueEl.stopAnimation();
            valueEl.animate(Ext.merge({
                from: {
                    width: me.valueToPercent(oldValue)
                },
                to: {
                    width: newWidth
                }
            }, animate));
        }
        me.refreshTooltip();
        if (!me.isConfiguring) {
            // Since we are (re)configured many times as we are used in a grid cell, we
            // avoid firing the change event unless there are listeners.
            if (me.hasListeners.change) {
                me.fireEvent('change', me, value, oldValue);
            }
            column = me.getWidgetColumn && me.getWidgetColumn();
            record = column && me.getWidgetRecord && me.getWidgetRecord();
            if (record && column.dataIndex) {
                // When used in a widgetcolumn, we should update the backing field. The
                // linkages will be cleared as we are being recycled, so this will only
                // reach this line when we are properly attached to a record and the
                // change is coming from the user (or a call to setValue).
                record.set(column.dataIndex, value);
            }
        }
    },
    //-------------------------------------------------------------------------
    // Config System Optimizations
    //
    // These are to deal with configs that combine to determine what should be
    // rendered in the DOM. For example, "glyphs" and "limit" must both be known
    // to render the proper text nodes. The "tooltip" and "value" likewise are
    // used to update the tooltipText.
    //
    // To avoid multiple updates to the DOM (one for each config), we simply mark
    // the rendering as invalid and post-process these flags on the tail of any
    // bulk updates.
    afterCachedConfig: function() {
        // Now that we are done setting up the initial values we need to refresh the
        // DOM before we allow Ext.Widget's implementation to cloneNode on it.
        this.refresh();
        return this.callParent(arguments);
    },
    initConfig: function(instanceConfig) {
        this.isConfiguring = true;
        this.callParent([
            instanceConfig
        ]);
        // The firstInstance will already have refreshed the DOM (in afterCacheConfig)
        // but all instances beyond the first need to refresh if they have custom values
        // for one or more configs that affect the DOM (such as "glyphs" and "limit").
        this.refresh();
    },
    setConfig: function() {
        var me = this;
        // Since we could be updating multiple configs, save any updates that need
        // multiple values for afterwards.
        me.isReconfiguring = true;
        me.callParent(arguments);
        me.isReconfiguring = false;
        // Now that all new values are set, we can refresh the DOM.
        me.refresh();
        return me;
    },
    //-------------------------------------------------------------------------
    destroy: function() {
        var me = this,
            tip = me.tip;
        if (tip) {
            me.tip = Ext.destroy(tip);
        }
        me.callParent();
    },
    privates: {
        /**
         * This method returns the DOM text node into which glyphs are placed.
         * @param {HTMLElement} dom The DOM node parent of the text node.
         * @return {HTMLTextNode} The text node.
         * @private
         */
        getGlyphTextNode: function(dom) {
            var node = dom.lastChild;
            // We want all our text nodes to be at the end of the child list, most
            // especially the text node on the innerEl. That text node affects the
            // default left/right position of our absolutely positioned child divs
            // (trackerEl and valueEl).
            if (!node || node.nodeType !== 3) {
                node = dom.ownerDocument.createTextNode('');
                dom.appendChild(node);
            }
            return node;
        },
        getTooltipData: function() {
            var me = this;
            return {
                component: me,
                tracking: me.getTrackingValue(),
                trackOver: me.getTrackOver(),
                value: me.getValue()
            };
        },
        /**
         * Forcibly refreshes both glyph and tooltip rendering.
         * @private
         */
        refresh: function() {
            var me = this;
            if (me.invalidGlyphs) {
                me.refreshGlyphs(true);
            }
            if (me.invalidTooltip) {
                me.refreshTooltip(true);
            }
        },
        /**
         * Refreshes the glyph text rendering unless we are currently performing a
         * bulk config change (initConfig or setConfig).
         * @param {Boolean} now Pass `true` to force the refresh to happen now.
         * @private
         */
        refreshGlyphs: function(now) {
            var me = this,
                later = !now && (me.isConfiguring || me.isReconfiguring),
                el, glyphs, limit, on, off, trackerEl, valueEl;
            if (!later) {
                el = me.getGlyphTextNode(me.innerEl.dom);
                valueEl = me.getGlyphTextNode(me.valueEl.dom);
                trackerEl = me.getGlyphTextNode(me.trackerEl.dom);
                glyphs = me.getGlyphs();
                limit = me.getLimit();
                for (on = off = ''; limit--; ) {
                    off += glyphs[0];
                    on += glyphs[1];
                }
                el.nodeValue = off;
                valueEl.nodeValue = on;
                trackerEl.nodeValue = on;
            }
            me.invalidGlyphs = later;
        },
        /**
         * Refreshes the tooltip text rendering unless we are currently performing a
         * bulk config change (initConfig or setConfig).
         * @param {Boolean} now Pass `true` to force the refresh to happen now.
         * @private
         */
        refreshTooltip: function(now) {
            var me = this,
                later = !now && (me.isConfiguring || me.isReconfiguring),
                tooltip = me.getTooltip(),
                data, text;
            if (!later) {
                tooltip = me.getTooltip();
                if (tooltip) {
                    data = me.getTooltipData();
                    text = tooltip(data);
                    me.setTooltipText(text);
                }
            }
            me.invalidTooltip = later;
        },
        /**
         * Convert the coordinates of the given `Event` into a rating value.
         * @param {Ext.Event} event The event.
         * @return {Number} The rating based on the given event coordinates.
         * @private
         */
        valueFromEvent: function(event) {
            var me = this,
                el = me.innerEl,
                ex = event.getX(),
                rounding = me.getRounding(),
                cx = el.getX(),
                x = ex - cx,
                w = el.getWidth(),
                limit = me.getLimit(),
                v;
            if (me.getInherited().rtl) {
                x = w - x;
            }
            v = x / w * limit;
            // We have to round up here so that the area we are over is considered
            // the value.
            v = Math.ceil(v / rounding) * rounding;
            return v;
        },
        /**
         * Convert the given rating into a width percentage.
         * @param {Number} value The rating value to convert.
         * @return {String} The width percentage to represent the given value.
         * @private
         */
        valueToPercent: function(value) {
            value = (value / this.getLimit()) * 100;
            return value + '%';
        }
    }
});

/**
 * Basic status bar component that can be used as the bottom toolbar of any {@link Ext.Panel}.  In addition to
 * supporting the standard {@link Ext.toolbar.Toolbar} interface for adding buttons, menus and other items, the StatusBar
 * provides a greedy status element that can be aligned to either side and has convenient methods for setting the
 * status text and icon.  You can also indicate that something is processing using the {@link #showBusy} method.
 *
 *     Ext.create('Ext.Panel', {
 *         title: 'StatusBar',
 *         // etc.
 *         bbar: Ext.create('Ext.ux.StatusBar', {
 *             id: 'my-status',
 *      
 *             // defaults to use when the status is cleared:
 *             defaultText: 'Default status text',
 *             defaultIconCls: 'default-icon',
 *      
 *             // values to set initially:
 *             text: 'Ready',
 *             iconCls: 'ready-icon',
 *      
 *             // any standard Toolbar items:
 *             items: [{
 *                 text: 'A Button'
 *             }, '-', 'Plain Text']
 *         })
 *     });
 *
 *     // Update the status bar later in code:
 *     var sb = Ext.getCmp('my-status');
 *     sb.setStatus({
 *         text: 'OK',
 *         iconCls: 'ok-icon',
 *         clear: true // auto-clear after a set interval
 *     });
 *
 *     // Set the status bar to show that something is processing:
 *     sb.showBusy();
 *
 *     // processing....
 *
 *     sb.clearStatus(); // once completeed
 *
 */
Ext.define('Ext.ux.statusbar.StatusBar', {
    extend: 'Ext.toolbar.Toolbar',
    alternateClassName: 'Ext.ux.StatusBar',
    alias: 'widget.statusbar',
    requires: ['Ext.toolbar.TextItem'],
    /**
     * @cfg {String} statusAlign
     * The alignment of the status element within the overall StatusBar layout.  When the StatusBar is rendered,
     * it creates an internal div containing the status text and icon.  Any additional Toolbar items added in the
     * StatusBar's {@link #cfg-items} config, or added via {@link #method-add} or any of the supported add* methods, will be
     * rendered, in added order, to the opposite side.  The status element is greedy, so it will automatically
     * expand to take up all sapce left over by any other items.  Example usage:
     *
     *     // Create a left-aligned status bar containing a button,
     *     // separator and text item that will be right-aligned (default):
     *     Ext.create('Ext.Panel', {
     *         title: 'StatusBar',
     *         // etc.
     *         bbar: Ext.create('Ext.ux.statusbar.StatusBar', {
     *             defaultText: 'Default status text',
     *             id: 'status-id',
     *             items: [{
     *                 text: 'A Button'
     *             }, '-', 'Plain Text']
     *         })
     *     });
     *
     *     // By adding the statusAlign config, this will create the
     *     // exact same toolbar, except the status and toolbar item
     *     // layout will be reversed from the previous example:
     *     Ext.create('Ext.Panel', {
     *         title: 'StatusBar',
     *         // etc.
     *         bbar: Ext.create('Ext.ux.statusbar.StatusBar', {
     *             defaultText: 'Default status text',
     *             id: 'status-id',
     *             statusAlign: 'right',
     *             items: [{
     *                 text: 'A Button'
     *             }, '-', 'Plain Text']
     *         })
     *     });
     */
    /**
     * @cfg {String} [defaultText='']
     * The default {@link #text} value.  This will be used anytime the status bar is cleared with the
     * `useDefaults:true` option.
     */
    /**
     * @cfg {String} [defaultIconCls='']
     * The default {@link #iconCls} value (see the iconCls docs for additional details about customizing the icon).
     * This will be used anytime the status bar is cleared with the `useDefaults:true` option.
     */
    /**
     * @cfg {String} text
     * A string that will be <b>initially</b> set as the status message.  This string
     * will be set as innerHTML (html tags are accepted) for the toolbar item.
     * If not specified, the value set for {@link #defaultText} will be used.
     */
    /**
     * @cfg {String} [iconCls='']
     * A CSS class that will be **initially** set as the status bar icon and is
     * expected to provide a background image.
     *
     * Example usage:
     *
     *     // Example CSS rule:
     *     .x-statusbar .x-status-custom {
     *         padding-left: 25px;
     *         background: transparent url(images/custom-icon.gif) no-repeat 3px 2px;
     *     }
     *
     *     // Setting a default icon:
     *     var sb = Ext.create('Ext.ux.statusbar.StatusBar', {
     *         defaultIconCls: 'x-status-custom'
     *     });
     *
     *     // Changing the icon:
     *     sb.setStatus({
     *         text: 'New status',
     *         iconCls: 'x-status-custom'
     *     });
     */

    /**
     * @cfg {String} cls
     * The base class applied to the containing element for this component on render.
     */
    cls : 'x-statusbar',
    /**
     * @cfg {String} busyIconCls
     * The default {@link #iconCls} applied when calling {@link #showBusy}.
     * It can be overridden at any time by passing the `iconCls` argument into {@link #showBusy}.
     */
    busyIconCls : 'x-status-busy',
    /**
     * @cfg {String} busyText
     * The default {@link #text} applied when calling {@link #showBusy}.
     * It can be overridden at any time by passing the `text` argument into {@link #showBusy}.
     */
    busyText : 'Loading...',
    /**
     * @cfg {Number} autoClear
     * The number of milliseconds to wait after setting the status via
     * {@link #setStatus} before automatically clearing the status text and icon.
     * Note that this only applies when passing the `clear` argument to {@link #setStatus}
     * since that is the only way to defer clearing the status.  This can
     * be overridden by specifying a different `wait` value in {@link #setStatus}.
     * Calls to {@link #clearStatus} always clear the status bar immediately and ignore this value.
     */
    autoClear : 5000,

    /**
     * @cfg {String} emptyText
     * The text string to use if no text has been set. If there are no other items in
     * the toolbar using an empty string (`''`) for this value would end up in the toolbar
     * height collapsing since the empty string will not maintain the toolbar height.
     * Use `''` if the toolbar should collapse in height vertically when no text is
     * specified and there are no other items in the toolbar.
     */
    emptyText : '&#160;',

    // private
    activeThreadId : 0,

    // private
    initComponent : function(){
        var right = this.statusAlign === 'right';

        this.callParent(arguments);
        this.currIconCls = this.iconCls || this.defaultIconCls;
        this.statusEl = Ext.create('Ext.toolbar.TextItem', {
            cls: 'x-status-text ' + (this.currIconCls || ''),
            text: this.text || this.defaultText || ''
        });

        if (right) {
            this.cls += ' x-status-right';
            this.add('->');
            this.add(this.statusEl);
        } else {
            this.insert(0, this.statusEl);
            this.insert(1, '->');
        }
    },

    /**
     * Sets the status {@link #text} and/or {@link #iconCls}. Also supports automatically clearing the
     * status that was set after a specified interval.
     *
     * Example usage:
     *
     *     // Simple call to update the text
     *     statusBar.setStatus('New status');
     *
     *     // Set the status and icon, auto-clearing with default options:
     *     statusBar.setStatus({
     *         text: 'New status',
     *         iconCls: 'x-status-custom',
     *         clear: true
     *     });
     *
     *     // Auto-clear with custom options:
     *     statusBar.setStatus({
     *         text: 'New status',
     *         iconCls: 'x-status-custom',
     *         clear: {
     *             wait: 8000,
     *             anim: false,
     *             useDefaults: false
     *         }
     *     });
     *
     * @param {Object/String} config A config object specifying what status to set, or a string assumed
     * to be the status text (and all other options are defaulted as explained below). A config
     * object containing any or all of the following properties can be passed:
     *
     * @param {String} config.text The status text to display.  If not specified, any current
     * status text will remain unchanged.
     *
     * @param {String} config.iconCls The CSS class used to customize the status icon (see
     * {@link #iconCls} for details). If not specified, any current iconCls will remain unchanged.
     *
     * @param {Boolean/Number/Object} config.clear Allows you to set an internal callback that will
     * automatically clear the status text and iconCls after a specified amount of time has passed. If clear is not
     * specified, the new status will not be auto-cleared and will stay until updated again or cleared using
     * {@link #clearStatus}. If `true` is passed, the status will be cleared using {@link #autoClear},
     * {@link #defaultText} and {@link #defaultIconCls} via a fade out animation. If a numeric value is passed,
     * it will be used as the callback interval (in milliseconds), overriding the {@link #autoClear} value.
     * All other options will be defaulted as with the boolean option.  To customize any other options,
     * you can pass an object in the format:
     * 
     * @param {Number} config.clear.wait The number of milliseconds to wait before clearing
     * (defaults to {@link #autoClear}).
     * @param {Boolean} config.clear.anim False to clear the status immediately once the callback
     * executes (defaults to true which fades the status out).
     * @param {Boolean} config.clear.useDefaults False to completely clear the status text and iconCls
     * (defaults to true which uses {@link #defaultText} and {@link #defaultIconCls}).
     *
     * @return {Ext.ux.statusbar.StatusBar} this
     */
    setStatus : function(o) {
        var me = this;

        o = o || {};
        Ext.suspendLayouts();
        if (Ext.isString(o)) {
            o = {text:o};
        }
        if (o.text !== undefined) {
            me.setText(o.text);
        }
        if (o.iconCls !== undefined) {
            me.setIcon(o.iconCls);
        }

        if (o.clear) {
            var c = o.clear,
                wait = me.autoClear,
                defaults = {useDefaults: true, anim: true};

            if (Ext.isObject(c)) {
                c = Ext.applyIf(c, defaults);
                if (c.wait) {
                    wait = c.wait;
                }
            } else if (Ext.isNumber(c)) {
                wait = c;
                c = defaults;
            } else if (Ext.isBoolean(c)) {
                c = defaults;
            }

            c.threadId = this.activeThreadId;
            Ext.defer(me.clearStatus, wait, me, [c]);
        }
        Ext.resumeLayouts(true);
        return me;
    },

    /**
     * Clears the status {@link #text} and {@link #iconCls}. Also supports clearing via an optional fade out animation.
     *
     * @param {Object} [config] A config object containing any or all of the following properties.  If this
     * object is not specified the status will be cleared using the defaults below:
     * @param {Boolean} config.anim True to clear the status by fading out the status element (defaults
     * to false which clears immediately).
     * @param {Boolean} config.useDefaults True to reset the text and icon using {@link #defaultText} and
     * {@link #defaultIconCls} (defaults to false which sets the text to '' and removes any existing icon class).
     *
     * @return {Ext.ux.statusbar.StatusBar} this
     */
    clearStatus : function(o) {
        o = o || {};

        var me = this,
            statusEl = me.statusEl;

        if (o.threadId && o.threadId !== me.activeThreadId) {
            // this means the current call was made internally, but a newer
            // thread has set a message since this call was deferred.  Since
            // we don't want to overwrite a newer message just ignore.
            return me;
        }

        var text = o.useDefaults ? me.defaultText : me.emptyText,
            iconCls = o.useDefaults ? (me.defaultIconCls ? me.defaultIconCls : '') : '';

        if (o.anim) {
            // animate the statusEl Ext.Element
            statusEl.el.puff({
                remove: false,
                useDisplay: true,
                callback: function() {
                    statusEl.el.show();
                    me.setStatus({
                        text: text,
                        iconCls: iconCls
                    });
                }
            });
        } else {
             me.setStatus({
                 text: text,
                 iconCls: iconCls
             });
        }
        return me;
    },

    /**
     * Convenience method for setting the status text directly.  For more flexible options see {@link #setStatus}.
     * @param {String} text (optional) The text to set (defaults to '')
     * @return {Ext.ux.statusbar.StatusBar} this
     */
    setText : function(text) {
        var me = this;
        me.activeThreadId++;
        me.text = text || '';
        if (me.rendered) {
            me.statusEl.setText(me.text);
        }
        return me;
    },

    /**
     * Returns the current status text.
     * @return {String} The status text
     */
    getText : function(){
        return this.text;
    },

    /**
     * Convenience method for setting the status icon directly.  For more flexible options see {@link #setStatus}.
     * See {@link #iconCls} for complete details about customizing the icon.
     * @param {String} iconCls (optional) The icon class to set (defaults to '', and any current icon class is removed)
     * @return {Ext.ux.statusbar.StatusBar} this
     */
    setIcon : function(cls) {
        var me = this;

        me.activeThreadId++;
        cls = cls || '';

        if (me.rendered) {
            if (me.currIconCls) {
                me.statusEl.removeCls(me.currIconCls);
                me.currIconCls = null;
            }
            if (cls.length > 0) {
                me.statusEl.addCls(cls);
                me.currIconCls = cls;
            }
        } else {
            me.currIconCls = cls;
        }
        return me;
    },

    /**
     * Convenience method for setting the status text and icon to special values that are pre-configured to indicate
     * a "busy" state, usually for loading or processing activities.
     *
     * @param {Object/String} config (optional) A config object in the same format supported by {@link #setStatus}, or a
     * string to use as the status text (in which case all other options for setStatus will be defaulted).  Use the
     * `text` and/or `iconCls` properties on the config to override the default {@link #busyText}
     * and {@link #busyIconCls} settings. If the config argument is not specified, {@link #busyText} and
     * {@link #busyIconCls} will be used in conjunction with all of the default options for {@link #setStatus}.
     * @return {Ext.ux.statusbar.StatusBar} this
     */
    showBusy : function(o){
        if (Ext.isString(o)) {
            o = { text: o };
        }
        o = Ext.applyIf(o || {}, {
            text: this.busyText,
            iconCls: this.busyIconCls
        });
        return this.setStatus(o);
    }
});

/**
 * An explorer component for navigating hierarchical content.  Consists of a breadcrumb bar
 * at the top, tree navigation on the left, and a center panel which displays the contents
 * of a given node.
 */
Ext.define('Ext.ux.Explorer', {
    extend: 'Ext.panel.Panel',
    xtype: 'explorer',
    requires: [
        'Ext.layout.container.Border',
        'Ext.toolbar.Breadcrumb',
        'Ext.tree.Panel'
    ],

    config: {
        /**
         * @cfg {Object} breadcrumb
         * Configuration object for the breadcrumb toolbar
         */
        breadcrumb: {
            dock: 'top',
            xtype: 'breadcrumb',
            reference: 'breadcrumb'
        },

        /**
         * @cfg {Object} contentView
         * Configuration object for the "content" data view
         */
        contentView: {
            xtype: 'dataview',
            reference: 'contentView',
            region: 'center',
            cls: Ext.baseCSSPrefix + 'explorer-view',
            itemSelector: '.' + Ext.baseCSSPrefix + 'explorer-item',
            tpl:
                '<tpl for=".">' +
                    '<div class="' + Ext.baseCSSPrefix + 'explorer-item">' +
                        '<div class="{iconCls}">' +
                            '<div class="' + Ext.baseCSSPrefix + 'explorer-node-icon' +
                                '{[values.leaf ? " ' + Ext.baseCSSPrefix + 'explorer-leaf-icon' + '" : ""]}' + '">' +
                            '</div>' +
                            '<div class="' + Ext.baseCSSPrefix + 'explorer-item-text">{text}</div>' +
                        '</div>' +
                    '</div>' +
                '</tpl>'
        },

        /**
         * @cfg {Ext.data.TreeStore} store
         * The TreeStore to use as the data source
         */
        store: null,

        /**
         * @cfg {Object} tree
         * Configuration object for the tree
         */
        tree: {
            xtype: 'treepanel',
            reference: 'tree',
            region: 'west',
            width: 200
        }
    },

    renderConfig: {
        /**
         * @cfg {Ext.data.TreeModel} selection
         * The selected node
         */
        selection: null
    },

    layout: 'border',
    referenceHolder: true,
    defaultListenerScope: true,
    cls: Ext.baseCSSPrefix + 'explorer',

    initComponent: function() {
        var me = this,
            store = me.getStore();

        //<debug>
        if (!store) {
            Ext.Error.raise('Ext.ux.Explorer requires a store.');
        }
        //</debug>

        me.dockedItems = [ me.getBreadcrumb() ];

        me.items = [ me.getTree(), me.getContentView() ];

        me.callParent();
    },

    applyBreadcrumb: function(breadcrumb) {
        var store = this.getStore();

        breadcrumb = Ext.create(Ext.apply({
            store: store,
            selection: store.getRoot()
        }, breadcrumb));

        breadcrumb.on('selectionchange', '_onBreadcrumbSelectionChange', this);

        return breadcrumb;
    },

    applyContentView: function(contentView) {
        /**
         * @property {Ext.data.Store} contentStore
         * @private
         * The backing store for the content view
         */
        var contentStore = this.contentStore = new Ext.data.Store({
            model: this.getStore().model
        });

        contentView = Ext.create(Ext.apply({
            store: contentStore
        }, contentView));

        return contentView;
    },

    applyTree: function(tree) {
        tree = Ext.create(Ext.apply({
            store: this.getStore()
        }, tree));

        tree.on('selectionchange', '_onTreeSelectionChange', this);

        return tree;
    },

    updateSelection: function(node) {
        var me = this,
            refs = me.getReferences(),
            breadcrumb = refs.breadcrumb,
            tree = refs.tree,
            treeSelectionModel = tree.getSelectionModel(),
            contentStore = me.contentStore,
            parentNode, treeView;

        if (breadcrumb.getSelection() !== node) {
            breadcrumb.setSelection(node);
        }

        if (treeSelectionModel.getSelection()[0] !== node) {
            treeSelectionModel.select([node]);
            parentNode = node.parentNode;
            if (parentNode) {
                parentNode.expand();
            }
            treeView = tree.getView();
            treeView.scrollRowIntoView(treeView.getRow(node));
        }

        contentStore.removeAll();
        contentStore.add(node.hasChildNodes() ? node.childNodes : [node]);
    },

    updateStore: function(store) {
        this.getBreadcrumb().setStore(store);
    },

    privates: {
        /**
         * Handles the tree's selectionchange event
         * @private
         * @param {Ext.tree.Panel} tree
         * @param {Ext.data.TreeModel[]} selection
         */
        _onTreeSelectionChange: function(tree, selection) {
            this.setSelection(selection[0]);
        },

        /**
         * Handles the breadcrumb bar's selectionchange event
         */
        _onBreadcrumbSelectionChange: function(breadcrumb, selection) {
            this.setSelection(selection);
        }
    }
});
/**
 * @author Ed Spencer (http://sencha.com)
 * Transition plugin for DataViews
 */
Ext.ux.DataViewTransition = Ext.extend(Object, {

    /**
     * @property defaults
     * @type Object
     * Default configuration options for all DataViewTransition instances
     */
    defaults: {
        duration  : 750,
        idProperty: 'id'
    },
    
    /**
     * Creates the plugin instance, applies defaults
     * @constructor
     * @param {Object} config Optional config object
     */
    constructor: function(config) {
        Ext.apply(this, config || {}, this.defaults);
    },

    /**
     * Initializes the transition plugin. Overrides the dataview's default refresh function
     * @param {Ext.view.View} dataview The dataview
     */
    init: function(dataview) {
        /**
         * @property dataview
         * @type Ext.view.View
         * Reference to the DataView this instance is bound to
         */
        this.dataview = dataview;
        
        var idProperty = this.idProperty;
        dataview.blockRefresh = true;
        dataview.updateIndexes = Ext.Function.createSequence(dataview.updateIndexes, function() {
            this.getTargetEl().select(this.itemSelector).each(function(element, composite, index) {
                element.id = element.dom.id = Ext.util.Format.format("{0}-{1}", dataview.id, dataview.store.getAt(index).get(idProperty));
            }, this);
        }, dataview);
        
        /**
         * @property dataviewID
         * @type String
         * The string ID of the DataView component. This is used internally when animating child objects
         */
        this.dataviewID = dataview.id;
        
        /**
         * @property cachedStoreData
         * @type Object
         * A cache of existing store data, keyed by id. This is used to determine
         * whether any items were added or removed from the store on data change
         */
        this.cachedStoreData = {};
        
        //var store = dataview.store;
        
        //catch the store data with the snapshot immediately
        this.cacheStoreData(dataview.store.snapshot);
        
        dataview.store.on('datachanged', function(store) {
            var parentEl = dataview.getTargetEl(),
                calcItem = store.getAt(0),
                added    = this.getAdded(store),
                removed  = this.getRemoved(store),
                previous = this.getRemaining(store),
                existing = Ext.apply({}, previous, added);
            
            //hide old items
            Ext.each(removed, function(item) {
                Ext.fly(this.dataviewID + '-' + item.get(this.idProperty)).animate({
                    remove  : false,
                    duration: duration,
                    opacity : 0,
                    useDisplay: true
                });
            }, this);
            
            //store is empty
            if (calcItem == undefined) {
                this.cacheStoreData(store);
                return;
            }
            
            var el = Ext.get(this.dataviewID + "-" + calcItem.get(this.idProperty));
            
            //calculate the number of rows and columns we have
            var itemCount   = store.getCount(),
                itemWidth   = el.getMargin('lr') + el.getWidth(),
                itemHeight  = el.getMargin('bt') + el.getHeight(),
                dvWidth     = parentEl.getWidth(),
                columns     = Math.floor(dvWidth / itemWidth),
                rows        = Math.ceil(itemCount / columns),
                currentRows = Math.ceil(this.getExistingCount() / columns);
            
            //make sure the correct styles are applied to the parent element
            parentEl.applyStyles({
                display : 'block',
                position: 'relative'
            });
            
            //stores the current top and left values for each element (discovered below)
            var oldPositions = {},
                newPositions = {},
                elCache      = {};
            
            //find current positions of each element and save a reference in the elCache
            Ext.iterate(previous, function(id, item) {
                var id = item.get(this.idProperty),
                    el = elCache[id] = Ext.get(this.dataviewID + '-' + id);
                
                oldPositions[id] = {
                    top : el.getY()  - parentEl.getY()  - el.getMargin('t') - parentEl.getPadding('t'),
                    left: el.getX() - parentEl.getX() - el.getMargin('l') - parentEl.getPadding('l')
                };
            }, this);
            
            //set absolute positioning on all DataView items. We need to set position, left and 
            //top at the same time to avoid any flickering
            Ext.iterate(previous, function(id, item) {
                var oldPos = oldPositions[id],
                    el     = elCache[id];
                    
                if (el.getStyle('position') != 'absolute') {
                    elCache[id].applyStyles({
                        position: 'absolute',
                        left    : oldPos.left + "px",
                        top     : oldPos.top + "px",

                        //we set the width here to make ListViews work correctly. This is not needed for DataViews
                        width   : el.getWidth(!Ext.isIE || Ext.isStrict),
                        height  : el.getHeight(!Ext.isIE || Ext.isStrict)
                    });
                }
            });
            
            //get new positions
            var index = 0;
            Ext.iterate(store.data.items, function(item) {
                var id = item.get(idProperty),
                    el = elCache[id];
                
                var column = index % columns,
                    row    = Math.floor(index / columns),
                    top    = row    * itemHeight,
                    left   = column * itemWidth;
                
                newPositions[id] = {
                    top : top,
                    left: left
                };
                
                index ++;
            }, this);
            
            //do the movements
            var startTime  = new Date(),
                duration   = this.duration,
                dataviewID = this.dataviewID;
            
            var doAnimate = function() {
                var elapsed  = new Date() - startTime,
                    fraction = elapsed / duration;
                
                if (fraction >= 1) {
                    for (var id in newPositions) {
                        Ext.fly(dataviewID + '-' + id).applyStyles({
                            top : newPositions[id].top + "px",
                            left: newPositions[id].left + "px"
                        });
                    }
                    
                    Ext.TaskManager.stop(task);
                } else {
                    //move each item
                    for (var id in newPositions) {
                        if (!previous[id]) continue;
                        
                        var oldPos  = oldPositions[id],
                            newPos  = newPositions[id],
                            oldTop  = oldPos.top,
                            newTop  = newPos.top,
                            oldLeft = oldPos.left,
                            newLeft = newPos.left,
                            diffTop = fraction * Math.abs(oldTop  - newTop),
                            diffLeft= fraction * Math.abs(oldLeft - newLeft),
                            midTop  = oldTop  > newTop  ? oldTop  - diffTop  : oldTop  + diffTop,
                            midLeft = oldLeft > newLeft ? oldLeft - diffLeft : oldLeft + diffLeft;
                        
                        Ext.fly(dataviewID + '-' + id).applyStyles({
                            top : midTop + "px",
                            left: midLeft + "px"
                        });
                    }
                }
            };
            
            var task = {
                run     : doAnimate,
                interval: 20,
                scope   : this
            };
            
            Ext.TaskManager.start(task);
            
            //<debug>
            var count = 0;
            for (var k in added) {
                count++;
            }
            if (Ext.global.console && Ext.global.console.log) {
                Ext.global.console.log('added:', count);
            }
            //</debug>
            
            //show new items
            Ext.iterate(added, function(id, item) {
                Ext.fly(this.dataviewID + '-' + item.get(this.idProperty)).applyStyles({
                    top    : newPositions[item.get(this.idProperty)].top + "px",
                    left   : newPositions[item.get(this.idProperty)].left + "px"
                });
                
                Ext.fly(this.dataviewID + '-' + item.get(this.idProperty)).animate({
                    remove  : false,
                    duration: duration,
                    opacity : 1
                });
            }, this);
            
            this.cacheStoreData(store);
        }, this);
    },
    
    /**
     * Caches the records from a store locally for comparison later
     * @param {Ext.data.Store} store The store to cache data from
     */
    cacheStoreData: function(store) {
        this.cachedStoreData = {};
        
        store.each(function(record) {
             this.cachedStoreData[record.get(this.idProperty)] = record;
        }, this);
    },
    
    /**
     * Returns all records that were already in the DataView
     * @return {Object} All existing records
     */
    getExisting: function() {
        return this.cachedStoreData;
    },
    
    /**
     * Returns the total number of items that are currently visible in the DataView
     * @return {Number} The number of existing items
     */
    getExistingCount: function() {
        var count = 0,
            items = this.getExisting();
        
        for (var k in items) count++;
        
        return count;
    },
    
    /**
     * Returns all records in the given store that were not already present
     * @param {Ext.data.Store} store The updated store instance
     * @return {Object} Object of records not already present in the dataview in format {id: record}
     */
    getAdded: function(store) {
        var added = {};
        
        store.each(function(record) {
            if (this.cachedStoreData[record.get(this.idProperty)] == undefined) {
                added[record.get(this.idProperty)] = record;
            }
        }, this);
        
        return added;
    },
    
    /**
     * Returns all records that are present in the DataView but not the new store
     * @param {Ext.data.Store} store The updated store instance
     * @return {Array} Array of records that used to be present
     */
    getRemoved: function(store) {
        var removed = [];
        
        for (var id in this.cachedStoreData) {
            if (store.findExact(this.idProperty, Number(id)) == -1) {
                removed.push(this.cachedStoreData[id]);
            }
        }
        
        return removed;
    },
    
    /**
     * Returns all records that are already present and are still present in the new store
     * @param {Ext.data.Store} store The updated store instance
     * @return {Object} Object of records that are still present from last time in format {id: record}
     */
    getRemaining: function(store) {
        var remaining = {};

        store.each(function(record) {
            if (this.cachedStoreData[record.get(this.idProperty)] != undefined) {
                remaining[record.get(this.idProperty)] = record;
            }
        }, this);

        return remaining;
    }
});
/**
 * @class Ext.ux.DataTip
 * @extends Ext.ToolTip.
 * This plugin implements automatic tooltip generation for an arbitrary number of child nodes *within* a Component.
 *
 * This plugin is applied to a high level Component, which contains repeating elements, and depending on the host Component type,
 * it automatically selects a {@link Ext.ToolTip#delegate delegate} so that it appears when the mouse enters a sub-element.
 *
 * When applied to a GridPanel, this ToolTip appears when over a row, and the Record's data is applied
 * using this object's {@link #tpl} template.
 *
 * When applied to a DataView, this ToolTip appears when over a view node, and the Record's data is applied
 * using this object's {@link #tpl} template.
 *
 * When applied to a TreePanel, this ToolTip appears when over a tree node, and the Node's {@link Ext.data.Model} record data is applied
 * using this object's {@link #tpl} template.
 *
 * When applied to a FormPanel, this ToolTip appears when over a Field, and the Field's `tooltip` property is used is applied
 * using this object's {@link #tpl} template, or if it is a string, used as HTML content. If there is no `tooltip` property,
 * the field itself is used as the template's data object.
 *
 * If more complex logic is needed to determine content, then the {@link #beforeshow} event may be used.
 * This class also publishes a **`beforeshowtip`** event through its host Component. The *host Component* fires the
 * **`beforeshowtip`** event.
 */
Ext.define('Ext.ux.DataTip', function(DataTip) {

//  Target the body (if the host is a Panel), or, if there is no body, the main Element.
    function onHostRender() {
        var e = this.isXType('panel') ? this.body : this.el;
        if (this.dataTip.renderToTarget) {
            this.dataTip.render(e);
        }
        this.dataTip.setTarget(e);
    }

    function updateTip(tip, data) {
        if (tip.rendered) {
            if (tip.host.fireEvent('beforeshowtip', tip.eventHost, tip, data) === false) {
                return false;
            }
            tip.update(data);
        } else {
            if (Ext.isString(data)) {
                tip.html = data;
            } else {
                tip.data = data;
            }
        }
    }

    function beforeViewTipShow(tip) {
        var rec = this.view.getRecord(tip.triggerElement),
            data;

        if (rec) {
            data = tip.initialConfig.data ? Ext.apply(tip.initialConfig.data, rec.data) : rec.data;
            return updateTip(tip, data);
        } else {
            return false;
        }
    }

    function beforeFormTipShow(tip) {
        var field = Ext.getCmp(tip.triggerElement.id);
        if (field && (field.tooltip || tip.tpl)) {
            return updateTip(tip, field.tooltip || field);
        } else {
            return false;
        }
    }

    return {
        extend: 'Ext.tip.ToolTip',

        mixins: {
            plugin: 'Ext.plugin.Abstract'
        },

        alias: 'plugin.datatip',

        lockableScope: 'both',

        constructor: function(config) {
            var me = this;
            me.callParent([config]);
            me.mixins.plugin.constructor.call(me, config);
        },

        init: function(host) {
            var me = this;

            me.mixins.plugin.init.call(me, host);
            host.dataTip = me;
            me.host = host;

            if (host.isXType('tablepanel')) {
                me.view = host.getView();
                if (host.ownerLockable) {
                    me.host = host.ownerLockable;
                }
                me.delegate = me.delegate || me.view.rowSelector;
                me.on('beforeshow', beforeViewTipShow);
            } else if (host.isXType('dataview')) {
                me.view = me.host;
                me.delegate = me.delegate || host.itemSelector;
                me.on('beforeshow', beforeViewTipShow);
            } else if (host.isXType('form')) {
                me.delegate = '.' + Ext.form.Labelable.prototype.formItemCls;
                me.on('beforeshow', beforeFormTipShow);
            } else if (host.isXType('combobox')) {
                me.view = host.getPicker();
                me.delegate = me.delegate || me.view.getItemSelector();
                me.on('beforeshow', beforeViewTipShow);
            }
            if (host.rendered) {
                onHostRender.call(host);
            } else {
                host.onRender = Ext.Function.createSequence(host.onRender, onHostRender);
            }
        }
    };
});
/**
 * This plugin can enable a cell to cell drag and drop operation within the same grid view.
 *
 * Note that the plugin must be added to the grid view, not to the grid panel. For example, using {@link Ext.panel.Table viewConfig}:
 *
 *      viewConfig: {
 *          plugins: {
 *              ptype: 'celldragdrop',
 *
 *              // Remove text from source cell and replace with value of emptyText.
 *              applyEmptyText: true,
 *
 *              //emptyText: Ext.String.htmlEncode('<<foo>>'),
 *
 *              // Will only allow drops of the same type.
 *              enforceType: true
 *          }
 *      }
 */
Ext.define('Ext.ux.CellDragDrop', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.celldragdrop',

    uses: ['Ext.view.DragZone'],

    /**
     * @cfg {Boolean} enforceType
     * Set to `true` to only allow drops of the same type.
     *
     * Defaults to `false`.
     */
    enforceType: false,

    /**
     * @cfg {Boolean} applyEmptyText
     * If `true`, then use the value of {@link #emptyText} to replace the drag record's value after a node drop.
     * Note that, if dropped on a cell of a different type, it will convert the default text according to its own conversion rules.
     *
     * Defaults to `false`.
     */
    applyEmptyText: false,

    /**
     * @cfg {Boolean} emptyText
     * If {@link #applyEmptyText} is `true`, then this value as the drag record's value after a node drop.
     *
     * Defaults to an empty string.
     */
    emptyText: '',

    /**
     * @cfg {Boolean} dropBackgroundColor
     * The default background color for when a drop is allowed.
     *
     * Defaults to green.
     */
    dropBackgroundColor: 'green',

    /**
     * @cfg {Boolean} noDropBackgroundColor
     * The default background color for when a drop is not allowed.
     *
     * Defaults to red.
     */
    noDropBackgroundColor: 'red',

    //<locale>
    /**
     * @cfg {String} dragText
     * The text to show while dragging.
     *
     * Two placeholders can be used in the text:
     *
     * - `{0}` The number of selected items.
     * - `{1}` 's' when more than 1 items (only useful for English).
     */
    dragText: '{0} selected row{1}',
    //</locale>

    /**
     * @cfg {String} ddGroup
     * A named drag drop group to which this object belongs. If a group is specified, then both the DragZones and
     * DropZone used by this plugin will only interact with other drag drop objects in the same group.
     */
    ddGroup: "GridDD",

    /**
     * @cfg {Boolean} enableDrop
     * Set to `false` to disallow the View from accepting drop gestures.
     */
    enableDrop: true,

    /**
     * @cfg {Boolean} enableDrag
     * Set to `false` to disallow dragging items from the View.
     */
    enableDrag: true,

    /**
     * @cfg {Object/Boolean} containerScroll
     * True to register this container with the Scrollmanager for auto scrolling during drag operations.
     * A {@link Ext.dd.ScrollManager} configuration may also be passed.
     */
    containerScroll: false,

    init: function (view) {
        var me = this;

        view.on('render', me.onViewRender, me, {
            single: true
        });
    },

    destroy: function () {
        var me = this;

        Ext.destroy(me.dragZone, me.dropZone);
    },

    enable: function () {
        var me = this;

        if (me.dragZone) {
            me.dragZone.unlock();
        }
        if (me.dropZone) {
            me.dropZone.unlock();
        }
        me.callParent();
    },

    disable: function () {
        var me = this;

        if (me.dragZone) {
            me.dragZone.lock();
        }
        if (me.dropZone) {
            me.dropZone.lock();
        }
        me.callParent();
    },

    onViewRender: function (view) {
        var me = this,
            scrollEl;

        if (me.enableDrag) {
            if (me.containerScroll) {
                scrollEl = view.getEl();
            }

            me.dragZone = new Ext.view.DragZone({
                view: view,
                ddGroup: me.dragGroup || me.ddGroup,
                dragText: me.dragText,
                containerScroll: me.containerScroll,
                scrollEl: scrollEl,
                getDragData: function (e) {
                    var view = this.view,
                        item = e.getTarget(view.getItemSelector()),
                        record = view.getRecord(item),
                        cell = e.getTarget(view.getCellSelector()),
                        dragEl, header;

                    if (item) {
                        dragEl = document.createElement('div');
                        dragEl.className = 'x-form-text';
                        dragEl.appendChild(document.createTextNode(cell.textContent || cell.innerText));

                        header = view.getHeaderByCell(cell);
                        return {
                            event: new Ext.EventObjectImpl(e),
                            ddel: dragEl,
                            item: e.target,
                            columnName: header.dataIndex,
                            record: record
                        };
                    }
                },

                onInitDrag: function (x, y) {
                    var self = this,
                        data = self.dragData,
                        view = self.view,
                        selectionModel = view.getSelectionModel(),
                        record = data.record,
                        el = data.ddel;

                    // Update the selection to match what would have been selected if the user had
                    // done a full click on the target node rather than starting a drag from it.
                    if (!selectionModel.isSelected(record)) {
                        selectionModel.select(record, true);
                    }

                    Ext.fly(self.ddel).update(el.textContent || el.innerText);
                    self.proxy.update(self.ddel);
                    self.onStartDrag(x, y);
                    return true;
                }
            });
        }

        if (me.enableDrop) {
            me.dropZone = new Ext.dd.DropZone(view.el, {
                view: view,
                ddGroup: me.dropGroup || me.ddGroup,
                containerScroll: true,

                getTargetFromEvent: function (e) {
                    var self = this,
                        view = self.view,
                        cell = e.getTarget(view.cellSelector),
                        row, header;

                    // Ascertain whether the mousemove is within a grid cell.
                    if (cell) {
                        row = view.findItemByChild(cell);
                        header = view.getHeaderByCell(cell);

                        if (row && header) {
                            return {
                                node: cell,
                                record: view.getRecord(row),
                                columnName: header.dataIndex
                            };
                        }
                    }
                },

                // On Node enter, see if it is valid for us to drop the field on that type of column.
                onNodeEnter: function (target, dd, e, dragData) {
                    var self = this,
                        destType = target.record.getField(target.columnName).type.toUpperCase(),
                        sourceType = dragData.record.getField(dragData.columnName).type.toUpperCase();

                    delete self.dropOK;

                    // Return if no target node or if over the same cell as the source of the drag.
                    if (!target || target.node === dragData.item.parentNode) {
                        return;
                    }

                    // Check whether the data type of the column being dropped on accepts the
                    // dragged field type. If so, set dropOK flag, and highlight the target node.
                    if (me.enforceType && destType !== sourceType) {

                        self.dropOK = false;

                        if (me.noDropCls) {
                            Ext.fly(target.node).addCls(me.noDropCls);
                        } else {
                            Ext.fly(target.node).applyStyles({
                                backgroundColor: me.noDropBackgroundColor
                            });
                        }

                        return false;
                    }

                    self.dropOK = true;

                    if (me.dropCls) {
                        Ext.fly(target.node).addCls(me.dropCls);
                    } else {
                        Ext.fly(target.node).applyStyles({
                            backgroundColor: me.dropBackgroundColor
                        });
                    }
                },

                // Return the class name to add to the drag proxy. This provides a visual indication
                // of drop allowed or not allowed.
                onNodeOver: function (target, dd, e, dragData) {
                    return this.dropOK ? this.dropAllowed : this.dropNotAllowed;
                },

                // Highlight the target node.
                onNodeOut: function (target, dd, e, dragData) {
                    var cls = this.dropOK ? me.dropCls : me.noDropCls;

                    if (cls) {
                        Ext.fly(target.node).removeCls(cls);
                    } else {
                        Ext.fly(target.node).applyStyles({
                            backgroundColor: ''
                        });
                    }
                },

                // Process the drop event if we have previously ascertained that a drop is OK.
                onNodeDrop: function (target, dd, e, dragData) {
                    if (this.dropOK) {
                        target.record.set(target.columnName, dragData.record.get(dragData.columnName));
                        if (me.applyEmptyText) {
                            dragData.record.set(dragData.columnName, me.emptyText);
                        }
                        return true;
                    }
                },

                onCellDrop: Ext.emptyFn
            });
        }
    }
});
/**
 * Base class from Ext.ux.TabReorderer.
 */
Ext.define('Ext.ux.BoxReorderer', {
    requires: [
        'Ext.dd.DD'
    ],

    mixins: {
        observable: 'Ext.util.Observable'
    },

    /**
     * @cfg {String} itemSelector
     * A {@link Ext.DomQuery DomQuery} selector which identifies the encapsulating elements of child
     * Components which participate in reordering.
     */
    itemSelector: '.x-box-item',

    /**
     * @cfg {Mixed} animate
     * If truthy, child reordering is animated so that moved boxes slide smoothly into position.
     * If this option is numeric, it is used as the animation duration in milliseconds.
     */
    animate: 100,

    /**
     * @event StartDrag
     * Fires when dragging of a child Component begins.
     * @param {Ext.ux.BoxReorderer} this
     * @param {Ext.container.Container} container The owning Container
     * @param {Ext.Component} dragCmp The Component being dragged
     * @param {Number} idx The start index of the Component being dragged.
     */

    /**
     * @event Drag
     * Fires during dragging of a child Component.
     * @param {Ext.ux.BoxReorderer} this
     * @param {Ext.container.Container} container The owning Container
     * @param {Ext.Component} dragCmp The Component being dragged
     * @param {Number} startIdx The index position from which the Component was initially dragged.
     * @param {Number} idx The current closest index to which the Component would drop.
     */

    /**
     * @event ChangeIndex
     * Fires when dragging of a child Component causes its drop index to change.
     * @param {Ext.ux.BoxReorderer} this
     * @param {Ext.container.Container} container The owning Container
     * @param {Ext.Component} dragCmp The Component being dragged
     * @param {Number} startIdx The index position from which the Component was initially dragged.
     * @param {Number} idx The current closest index to which the Component would drop.
     */

    /**
     * @event Drop
     * Fires when a child Component is dropped at a new index position.
     * @param {Ext.ux.BoxReorderer} this
     * @param {Ext.container.Container} container The owning Container
     * @param {Ext.Component} dragCmp The Component being dropped
     * @param {Number} startIdx The index position from which the Component was initially dragged.
     * @param {Number} idx The index at which the Component is being dropped.
     */

    constructor: function() {
        this.mixins.observable.constructor.apply(this, arguments);
    },

    init: function(container) {
        var me = this;

        me.container = container;

        // Set our animatePolicy to animate the start position (ie x for HBox, y for VBox)
        me.animatePolicy = {};
        me.animatePolicy[container.getLayout().names.x] = true;



        // Initialize the DD on first layout, when the innerCt has been created.
        me.container.on({
            scope: me,
            boxready: me.onBoxReady,
            beforedestroy: me.onContainerDestroy
        });
    },

    /**
     * @private Clear up on Container destroy
     */
    onContainerDestroy: function() {
        var dd = this.dd;
        if (dd) {
            dd.unreg();
            this.dd = null;
        }
    },

    onBoxReady: function() {
        var me = this,
            layout = me.container.getLayout(),
            names = layout.names,
            dd;

        // Create a DD instance. Poke the handlers in.
        // TODO: Ext5's DD classes should apply config to themselves.
        // TODO: Ext5's DD classes should not use init internally because it collides with use as a plugin
        // TODO: Ext5's DD classes should be Observable.
        // TODO: When all the above are trus, this plugin should extend the DD class.
        dd = me.dd = new Ext.dd.DD(layout.innerCt, me.container.id + '-reorderer');
        Ext.apply(dd, {
            animate: me.animate,
            reorderer: me,
            container: me.container,
            getDragCmp: me.getDragCmp,
            clickValidator: Ext.Function.createInterceptor(dd.clickValidator, me.clickValidator, me, false),
            onMouseDown: me.onMouseDown,
            startDrag: me.startDrag,
            onDrag: me.onDrag,
            endDrag: me.endDrag,
            getNewIndex: me.getNewIndex,
            doSwap: me.doSwap,
            findReorderable: me.findReorderable
        });

        // Decide which dimension we are measuring, and which measurement metric defines
        // the *start* of the box depending upon orientation.
        dd.dim = names.width;
        dd.startAttr = names.beforeX;
        dd.endAttr = names.afterX;
    },

    getDragCmp: function(e) {
        return this.container.getChildByElement(e.getTarget(this.itemSelector, 10));
    },

    // check if the clicked component is reorderable
    clickValidator: function(e) {
        var cmp = this.getDragCmp(e);

        // If cmp is null, this expression MUST be coerced to boolean so that createInterceptor is able to test it against false
        return !!(cmp && cmp.reorderable !== false);
    },

    onMouseDown: function(e) {
        var me = this,
            container = me.container,
            containerBox,
            cmpEl,
            cmpBox;

        // Ascertain which child Component is being mousedowned
        me.dragCmp = me.getDragCmp(e);
        if (me.dragCmp) {
            cmpEl = me.dragCmp.getEl();
            me.startIndex = me.curIndex = container.items.indexOf(me.dragCmp);

            // Start position of dragged Component
            cmpBox = cmpEl.getBox();

            // Last tracked start position
            me.lastPos = cmpBox[me.startAttr];

            // Calculate constraints depending upon orientation
            // Calculate offset from mouse to dragEl position
            containerBox = container.el.getBox();
            if (me.dim === 'width') {
                me.minX = containerBox.left;
                me.maxX = containerBox.right - cmpBox.width;
                me.minY = me.maxY = cmpBox.top;
                me.deltaX = e.getX() - cmpBox.left;
            } else {
                me.minY = containerBox.top;
                me.maxY = containerBox.bottom - cmpBox.height;
                me.minX = me.maxX = cmpBox.left;
                me.deltaY = e.getY() - cmpBox.top;
            }
            me.constrainY = me.constrainX = true;
        }
    },

    startDrag: function() {
        var me = this,
            dragCmp = me.dragCmp;

        if (dragCmp) {
            // For the entire duration of dragging the *Element*, defeat any positioning and animation of the dragged *Component*
            dragCmp.setPosition = Ext.emptyFn;
            dragCmp.animate = false;

            // Animate the BoxLayout just for the duration of the drag operation.
            if (me.animate) {
                me.container.getLayout().animatePolicy = me.reorderer.animatePolicy;
            }
            // We drag the Component element
            me.dragElId = dragCmp.getEl().id;
            me.reorderer.fireEvent('StartDrag', me, me.container, dragCmp, me.curIndex);
            // Suspend events, and set the disabled flag so that the mousedown and mouseup events
            // that are going to take place do not cause any other UI interaction.
            dragCmp.suspendEvents();
            dragCmp.disabled = true;
            dragCmp.el.setStyle('zIndex', 100);
        } else {
            me.dragElId = null;
        }
    },

    /**
     * @private
     * Find next or previous reorderable component index.
     * @param {Number} newIndex The initial drop index.
     * @return {Number} The index of the reorderable component.
     */
    findReorderable: function(newIndex) {
        var me = this,
            items = me.container.items,
            newItem;

        if (items.getAt(newIndex).reorderable === false) {
            newItem = items.getAt(newIndex);
            if (newIndex > me.startIndex) {
                 while(newItem && newItem.reorderable === false) {
                    newIndex++;
                    newItem = items.getAt(newIndex);
                }
            } else {
                while(newItem && newItem.reorderable === false) {
                    newIndex--;
                    newItem = items.getAt(newIndex);
                }
            }
        }

        newIndex = Math.min(Math.max(newIndex, 0), items.getCount() - 1);

        if (items.getAt(newIndex).reorderable === false) {
            return -1;
        }
        return newIndex;
    },

    /**
     * @private
     * Swap 2 components.
     * @param {Number} newIndex The initial drop index.
     */
    doSwap: function(newIndex) {
        var me = this,
            items = me.container.items,
            container = me.container,
            wasRoot = me.container._isLayoutRoot,
            orig, dest, tmpIndex;

        newIndex = me.findReorderable(newIndex);

        if (newIndex === -1) {
            return;
        }

        me.reorderer.fireEvent('ChangeIndex', me, container, me.dragCmp, me.startIndex, newIndex);
        orig = items.getAt(me.curIndex);
        dest = items.getAt(newIndex);
        items.remove(orig);
        tmpIndex = Math.min(Math.max(newIndex, 0), items.getCount() - 1);
        items.insert(tmpIndex, orig);
        items.remove(dest);
        items.insert(me.curIndex, dest);

        // Make the Box Container the topmost layout participant during the layout.
        container._isLayoutRoot = true;
        container.updateLayout();
        container._isLayoutRoot = wasRoot;
        me.curIndex = newIndex;
    },

    onDrag: function(e) {
        var me = this,
            newIndex;

        newIndex = me.getNewIndex(e.getPoint());
        if ((newIndex !== undefined)) {
            me.reorderer.fireEvent('Drag', me, me.container, me.dragCmp, me.startIndex, me.curIndex);
            me.doSwap(newIndex);
        }

    },

    endDrag: function(e) {
        if (e) {
            e.stopEvent();
        }
        var me = this,
            layout = me.container.getLayout(),
            temp;

        if (me.dragCmp) {
            delete me.dragElId;

            // Reinstate the Component's positioning method after mouseup, and allow the layout system to animate it.
            delete me.dragCmp.setPosition;
            me.dragCmp.animate = true;

            // Ensure the lastBox is correct for the animation system to restore to when it creates the "from" animation frame
            me.dragCmp.lastBox[layout.names.x] = me.dragCmp.getPosition(true)[layout.names.widthIndex];

            // Make the Box Container the topmost layout participant during the layout.
            me.container._isLayoutRoot = true;
            me.container.updateLayout();
            me.container._isLayoutRoot = undefined;

            // Attempt to hook into the afteranimate event of the drag Component to call the cleanup
            temp = Ext.fx.Manager.getFxQueue(me.dragCmp.el.id)[0];
            if (temp) {
                temp.on({
                    afteranimate: me.reorderer.afterBoxReflow,
                    scope: me
                });
            }
            // If not animated, clean up after the mouseup has happened so that we don't click the thing being dragged
            else {
                Ext.Function.defer(me.reorderer.afterBoxReflow, 1, me);
            }

            if (me.animate) {
                delete layout.animatePolicy;
            }
            me.reorderer.fireEvent('drop', me, me.container, me.dragCmp, me.startIndex, me.curIndex);
        }
    },

    /**
     * @private
     * Called after the boxes have been reflowed after the drop.
     * Re-enabled the dragged Component.
     */
    afterBoxReflow: function() {
        var me = this;
        me.dragCmp.el.setStyle('zIndex', '');
        me.dragCmp.disabled = false;
        me.dragCmp.resumeEvents();
    },

    /**
     * @private
     * Calculate drop index based upon the dragEl's position.
     */
    getNewIndex: function(pointerPos) {
        var me = this,
            dragEl = me.getDragEl(),
            dragBox = Ext.fly(dragEl).getBox(),
            targetEl,
            targetBox,
            targetMidpoint,
            i = 0,
            it = me.container.items.items,
            ln = it.length,
            lastPos = me.lastPos;

        me.lastPos = dragBox[me.startAttr];

        for (; i < ln; i++) {
            targetEl = it[i].getEl();

            // Only look for a drop point if this found item is an item according to our selector
            if (targetEl.is(me.reorderer.itemSelector)) {
                targetBox = targetEl.getBox();
                targetMidpoint = targetBox[me.startAttr] + (targetBox[me.dim] >> 1);
                if (i < me.curIndex) {
                    if ((dragBox[me.startAttr] < lastPos) && (dragBox[me.startAttr] < (targetMidpoint - 5))) {
                        return i;
                    }
                } else if (i > me.curIndex) {
                    if ((dragBox[me.startAttr] > lastPos) && (dragBox[me.endAttr] > (targetMidpoint + 5))) {
                        return i;
                    }
                }
            }
        }
    }
});
/**
 * A Picker field that contains a tree panel on its popup, enabling selection of tree nodes.
 */
Ext.define('Ext.ux.TreePicker', {
    extend: 'Ext.form.field.Picker',
    xtype: 'treepicker',
    
    uses: [
        'Ext.tree.Panel'
    ],

    triggerCls: Ext.baseCSSPrefix + 'form-arrow-trigger',

    config: {
        /**
         * @cfg {Ext.data.TreeStore} store
         * A tree store that the tree picker will be bound to
         */
        store: null,

        /**
         * @cfg {String} displayField
         * The field inside the model that will be used as the node's text.
         * Defaults to the default value of {@link Ext.tree.Panel}'s `displayField` configuration.
         */
        displayField: null,

        /**
         * @cfg {Array} columns
         * An optional array of columns for multi-column trees
         */
        columns: null,

        /**
         * @cfg {Boolean} selectOnTab
         * Whether the Tab key should select the currently highlighted item. Defaults to `true`.
         */
        selectOnTab: true,

        /**
         * @cfg {Number} maxPickerHeight
         * The maximum height of the tree dropdown. Defaults to 300.
         */
        maxPickerHeight: 300,

        /**
         * @cfg {Number} minPickerHeight
         * The minimum height of the tree dropdown. Defaults to 100.
         */
        minPickerHeight: 100
    },
   
    editable: false,

    /**
     * @event select
     * Fires when a tree node is selected
     * @param {Ext.ux.TreePicker} picker        This tree picker
     * @param {Ext.data.Model} record           The selected record
     */

    initComponent: function() {
        var me = this;

        me.callParent(arguments);

        me.mon(me.store, {
            scope: me,
            load: me.onLoad,
            update: me.onUpdate
        });
    },

    /**
     * Creates and returns the tree panel to be used as this field's picker.
     */
    createPicker: function() {
        var me = this,
            picker = new Ext.tree.Panel({
                shrinkWrapDock: 2,
                store: me.store,
                floating: true,
                displayField: me.displayField,
                columns: me.columns,
                minHeight: me.minPickerHeight,
                maxHeight: me.maxPickerHeight,
                manageHeight: false,
                shadow: false,
                listeners: {
                    scope: me,
                    itemclick: me.onItemClick
                },
                viewConfig: {
                    listeners: {
                        scope: me,
                        render: me.onViewRender
                    }
                }
            }),
            view = picker.getView();

        if (Ext.isIE9 && Ext.isStrict) {
            // In IE9 strict mode, the tree view grows by the height of the horizontal scroll bar when the items are highlighted or unhighlighted.
            // Also when items are collapsed or expanded the height of the view is off. Forcing a repaint fixes the problem.
            view.on({
                scope: me,
                highlightitem: me.repaintPickerView,
                unhighlightitem: me.repaintPickerView,
                afteritemexpand: me.repaintPickerView,
                afteritemcollapse: me.repaintPickerView
            });
        }
        return picker;
    },
    
    onViewRender: function(view){
        view.getEl().on('keypress', this.onPickerKeypress, this);
    },

    /**
     * repaints the tree view
     */
    repaintPickerView: function() {
        var style = this.picker.getView().getEl().dom.style;

        // can't use Element.repaint because it contains a setTimeout, which results in a flicker effect
        style.display = style.display;
    },

    /**
     * Handles a click even on a tree node
     * @private
     * @param {Ext.tree.View} view
     * @param {Ext.data.Model} record
     * @param {HTMLElement} node
     * @param {Number} rowIndex
     * @param {Ext.event.Event} e
     */
    onItemClick: function(view, record, node, rowIndex, e) {
        this.selectItem(record);
    },

    /**
     * Handles a keypress event on the picker element
     * @private
     * @param {Ext.event.Event} e
     * @param {HTMLElement} el
     */
    onPickerKeypress: function(e, el) {
        var key = e.getKey();

        if(key === e.ENTER || (key === e.TAB && this.selectOnTab)) {
            this.selectItem(this.picker.getSelectionModel().getSelection()[0]);
        }
    },

    /**
     * Changes the selection to a given record and closes the picker
     * @private
     * @param {Ext.data.Model} record
     */
    selectItem: function(record) {
        var me = this;
        me.setValue(record.getId());
        me.fireEvent('select', me, record);
        me.collapse();
    },

    /**
     * Runs when the picker is expanded.  Selects the appropriate tree node based on the value of the input element,
     * and focuses the picker so that keyboard navigation will work.
     * @private
     */
    onExpand: function() {
        var me = this,
            picker = me.picker,
            store = picker.store,
            value = me.value,
            node;

        
        if (value) {
            node = store.getNodeById(value);
        }
        
        if (!node) {
            node = store.getRoot();
        }
        
        picker.selectPath(node.getPath());
    },

    /**
     * Sets the specified value into the field
     * @param {Mixed} value
     * @return {Ext.ux.TreePicker} this
     */
    setValue: function(value) {
        var me = this,
            record;

        me.value = value;

        if (me.store.loading) {
            // Called while the Store is loading. Ensure it is processed by the onLoad method.
            return me;
        }
            
        // try to find a record in the store that matches the value
        record = value ? me.store.getNodeById(value) : me.store.getRoot();
        if (value === undefined) {
            record = me.store.getRoot();
            me.value = record.getId();
        } else {
            record = me.store.getNodeById(value);
        }

        // set the raw value to the record's display field if a record was found
        me.setRawValue(record ? record.get(me.displayField) : '');

        return me;
    },
    
    getSubmitValue: function(){
        return this.value;    
    },

    /**
     * Returns the current data value of the field (the idProperty of the record)
     * @return {Number}
     */
    getValue: function() {
        return this.value;
    },

    /**
     * Handles the store's load event.
     * @private
     */
    onLoad: function() {
        var value = this.value;

        if (value) {
            this.setValue(value);
        }
    },
    
    onUpdate: function(store, rec, type, modifiedFieldNames){
        var display = this.displayField;
        
        if (type === 'edit' && modifiedFieldNames && Ext.Array.contains(modifiedFieldNames, display) && this.value === rec.getId()) {
            this.setRawValue(rec.get(display));
        }
    }

});

/**
 * Plugin which allows items to be dropped onto a toolbar and be turned into new Toolbar items.
 * To use the plugin, you just need to provide a createItem implementation that takes the drop
 * data as an argument and returns an object that can be placed onto the toolbar. Example:
 * <pre>
 * Ext.create('Ext.ux.ToolbarDroppable', {
 *   createItem: function(data) {
 *     return Ext.create('Ext.Button', {text: data.text});
 *   }
 * });
 * </pre>
 * The afterLayout function can also be overridden, and is called after a new item has been
 * created and inserted into the Toolbar. Use this for any logic that needs to be run after
 * the item has been created.
 */
 Ext.define('Ext.ux.ToolbarDroppable', {

    /**
     * Creates new ToolbarDroppable.
     * @param {Object} config Config options.
     */
    constructor: function(config) {
      Ext.apply(this, config);
    },

    /**
     * Initializes the plugin and saves a reference to the toolbar
     * @param {Ext.toolbar.Toolbar} toolbar The toolbar instance
     */
    init: function(toolbar) {
      /**
       * @property toolbar
       * @type Ext.toolbar.Toolbar
       * The toolbar instance that this plugin is tied to
       */
      this.toolbar = toolbar;

      this.toolbar.on({
          scope : this,
          render: this.createDropTarget
      });
    },

    /**
     * Creates a drop target on the toolbar
     */
    createDropTarget: function() {
        /**
         * @property dropTarget
         * @type Ext.dd.DropTarget
         * The drop target attached to the toolbar instance
         */
        this.dropTarget = Ext.create('Ext.dd.DropTarget', this.toolbar.getEl(), {
            notifyOver: Ext.Function.bind(this.notifyOver, this),
            notifyDrop: Ext.Function.bind(this.notifyDrop, this)
        });
    },

    /**
     * Adds the given DD Group to the drop target
     * @param {String} ddGroup The DD Group
     */
    addDDGroup: function(ddGroup) {
        this.dropTarget.addToGroup(ddGroup);
    },

    /**
     * Calculates the location on the toolbar to create the new sorter button based on the XY of the
     * drag event
     * @param {Ext.event.Event} e The event object
     * @return {Number} The index at which to insert the new button
     */    
    calculateEntryIndex: function(e) {
        var entryIndex = 0,
            toolbar = this.toolbar,
            items = toolbar.items.items,
            count = items.length,
            xHover = e.getXY()[0],
            index = 0,
            el, xTotal, width, midpoint;
 
        for (; index < count; index++) {
            el = items[index].getEl();
            xTotal = el.getXY()[0];
            width = el.getWidth();
            midpoint = xTotal + width / 2;
 
            if (xHover < midpoint) {
                entryIndex = index; 
                break;
            } else {
                entryIndex = index + 1;
            }
       }
       return entryIndex;
    },

    /**
     * Returns true if the drop is allowed on the drop target. This function can be overridden
     * and defaults to simply return true
     * @param {Object} data Arbitrary data from the drag source
     * @return {Boolean} True if the drop is allowed
     */
    canDrop: function(data) {
        return true;
    },

    /**
     * Custom notifyOver method which will be used in the plugin's internal DropTarget
     * @return {String} The CSS class to add
     */
    notifyOver: function(dragSource, event, data) {
        return this.canDrop.apply(this, arguments) ? this.dropTarget.dropAllowed : this.dropTarget.dropNotAllowed;
    },

    /**
     * Called when the drop has been made. Creates the new toolbar item, places it at the correct location
     * and calls the afterLayout callback.
     */
    notifyDrop: function(dragSource, event, data) {
        var canAdd = this.canDrop(dragSource, event, data),
            tbar   = this.toolbar;

        if (canAdd) {
            var entryIndex = this.calculateEntryIndex(event);

            tbar.insert(entryIndex, this.createItem(data));
            tbar.doLayout();

            this.afterLayout();
        }

        return canAdd;
    },

    /**
     * Creates the new toolbar item based on drop data. This method must be implemented by the plugin instance
     * @param {Object} data Arbitrary data from the drop
     * @return {Mixed} An item that can be added to a toolbar
     */
    createItem: function(data) {
        //<debug>
        Ext.Error.raise("The createItem method must be implemented in the ToolbarDroppable plugin");
        //</debug>
    },

    /**
     * Called after a new button has been created and added to the toolbar. Add any required cleanup logic here
     */
    afterLayout: Ext.emptyFn
});
Ext.ns('Ext.ux');
/**
 * Plugin for adding a tab menu to a TabBar is the Tabs overflow.
 */
Ext.define('Ext.ux.TabScrollerMenu', {
    alias: 'plugin.tabscrollermenu',

    requires: ['Ext.menu.Menu'],

    /**
     * @cfg {Number} pageSize How many items to allow per submenu.
     */
    pageSize: 10,
    /**
     * @cfg {Number} maxText How long should the title of each {@link Ext.menu.Item} be.
     */
    maxText: 15,
    /**
     * @cfg {String} menuPrefixText Text to prefix the submenus.
     */
    menuPrefixText: 'Items',

    /**
     * Creates new TabScrollerMenu.
     * @param {Object} config Configuration options
     */
    constructor: function(config) {
        Ext.apply(this, config);
    },
    
    //private
    init: function(tabPanel) {
        var me = this;

        me.tabPanel = tabPanel;

        tabPanel.on({
            render: function() {
                me.tabBar = tabPanel.tabBar;
                me.layout = me.tabBar.layout;
                me.layout.overflowHandler.handleOverflow = Ext.Function.bind(me.showButton, me);
                me.layout.overflowHandler.clearOverflow = Ext.Function.createSequence(me.layout.overflowHandler.clearOverflow, me.hideButton, me);
            },
            destroy: me.destroy,
            scope: me,
            single: true
        });
    },

    showButton: function() {
        var me = this,
            result = Ext.getClass(me.layout.overflowHandler).prototype.handleOverflow.apply(me.layout.overflowHandler, arguments),
            button = me.menuButton;

        if (me.tabPanel.items.getCount() > 1) {
            if (!button) {
                button = me.menuButton = me.tabBar.body.createChild({
                    cls: Ext.baseCSSPrefix + 'tab-tabmenu-right'
                }, me.tabBar.body.child('.' + Ext.baseCSSPrefix + 'box-scroller-right'));
                button.addClsOnOver(Ext.baseCSSPrefix + 'tab-tabmenu-over');
                button.on('click', me.showTabsMenu, me);
            }
            button.setVisibilityMode(Ext.dom.Element.DISPLAY);
            button.show();
            result.reservedSpace += button.getWidth();
        } else {
            me.hideButton();
        }
        return result;
    },

    hideButton: function() {
        var me = this;
        if (me.menuButton) {
            me.menuButton.hide();
        }
    },

    /**
     * Returns an the current page size (this.pageSize);
     * @return {Number} this.pageSize The current page size.
     */
    getPageSize: function() {
        return this.pageSize;
    },
    /**
     * Sets the number of menu items per submenu "page size".
     * @param {Number} pageSize The page size
     */
    setPageSize: function(pageSize) {
        this.pageSize = pageSize;
    },
    /**
     * Returns the current maxText length;
     * @return {Number} this.maxText The current max text length.
     */
    getMaxText: function() {
        return this.maxText;
    },
    /**
     * Sets the maximum text size for each menu item.
     * @param {Number} t The max text per each menu item.
     */
    setMaxText: function(t) {
        this.maxText = t;
    },
    /**
     * Returns the current menu prefix text String.;
     * @return {String} this.menuPrefixText The current menu prefix text.
     */
    getMenuPrefixText: function() {
        return this.menuPrefixText;
    },
    /**
     * Sets the menu prefix text String.
     * @param {String} t The menu prefix text.
     */
    setMenuPrefixText: function(t) {
        this.menuPrefixText = t;
    },

    showTabsMenu: function(e) {
        var me = this;

        if (me.tabsMenu) {
            me.tabsMenu.removeAll();
        } else {
            me.tabsMenu = new Ext.menu.Menu();
        }

        me.generateTabMenuItems();

        var target = Ext.get(e.getTarget()),
            xy = target.getXY();

        //Y param + 24 pixels
        xy[1] += 24;

        me.tabsMenu.showAt(xy);
    },

    // private
    generateTabMenuItems: function() {
        var me = this,
            tabPanel = me.tabPanel,
            curActive = tabPanel.getActiveTab(),
            allItems = tabPanel.items.getRange(),
            pageSize = me.getPageSize(),
            tabsMenu = me.tabsMenu,
            totalItems, numSubMenus, remainder,
            i, curPage, menuItems, x, item, start, index;
            
        tabsMenu.suspendLayouts();
        allItems = Ext.Array.filter(allItems, function(item){
            if (item.id == curActive.id) {
                return false;
            }
            return item.hidden ? !!item.hiddenByLayout : true;
        });
        totalItems = allItems.length;
        numSubMenus = Math.floor(totalItems / pageSize);
        remainder = totalItems % pageSize;

        if (totalItems > pageSize) {

            // Loop through all of the items and create submenus in chunks of 10
            for (i = 0; i < numSubMenus; i++) {
                curPage = (i + 1) * pageSize;
                menuItems = [];

                for (x = 0; x < pageSize; x++) {
                    index = x + curPage - pageSize;
                    item = allItems[index];
                    menuItems.push(me.autoGenMenuItem(item));
                }

                tabsMenu.add({
                    text: me.getMenuPrefixText() + ' ' + (curPage - pageSize + 1) + ' - ' + curPage,
                    menu: menuItems
                });
            }
            // remaining items
            if (remainder > 0) {
                start = numSubMenus * pageSize;
                menuItems = [];
                for (i = start; i < totalItems; i++) {
                    item = allItems[i];
                    menuItems.push(me.autoGenMenuItem(item));
                }

                me.tabsMenu.add({
                    text: me.menuPrefixText + ' ' + (start + 1) + ' - ' + (start + menuItems.length),
                    menu: menuItems
                });

            }
        } else {
            for (i = 0; i < totalItems; ++i) {
                tabsMenu.add(me.autoGenMenuItem(allItems[i]));
            }
        }
        tabsMenu.resumeLayouts(true);
    },

    // private
    autoGenMenuItem: function(item) {
        var maxText = this.getMaxText(),
            text = Ext.util.Format.ellipsis(item.title, maxText);

        return {
            text: text,
            handler: this.showTabFromMenu,
            scope: this,
            disabled: item.disabled,
            tabToShow: item,
            iconCls: item.iconCls
        };
    },

    // private
    showTabFromMenu: function(menuItem) {
        this.tabPanel.setActiveTab(menuItem.tabToShow);
    },
    
    destroy: function(){
        Ext.destroy(this.tabsMenu, this.menuButton);       
    }
});
/**
 * This plugin allow you to reorder tabs of a TabPanel.
 */
Ext.define('Ext.ux.TabReorderer', {

    extend: 'Ext.ux.BoxReorderer',
    alias: 'plugin.tabreorderer',

    itemSelector: '.' + Ext.baseCSSPrefix + 'tab',

    init: function(tabPanel) {
        var me = this;
        
        me.callParent([tabPanel.getTabBar()]);

        // Ensure reorderable property is copied into dynamically added tabs
        tabPanel.onAdd = Ext.Function.createSequence(tabPanel.onAdd, me.onAdd);
    },

    onBoxReady: function() {
        var tabs,
            len,
            i = 0,
            tab;

        this.callParent(arguments);

        // Copy reorderable property from card into tab
        for (tabs = this.container.items.items, len = tabs.length; i < len; i++) {
            tab = tabs[i];
            if (tab.card) {
                tab.reorderable = tab.card.reorderable;
            }
        }
    },

    onAdd: function(card, index) {
        card.tab.reorderable = card.reorderable;
    },

    afterBoxReflow: function() {
        var me = this;

        // Cannot use callParent, this is not called in the scope of this plugin, but that of its Ext.dd.DD object
        Ext.ux.BoxReorderer.prototype.afterBoxReflow.apply(me, arguments);

        // Move the associated card to match the tab order
        if (me.dragCmp) {
            me.container.tabPanel.setActiveTab(me.dragCmp.card);
            me.container.tabPanel.move(me.startIndex, me.curIndex);
        }
    }
});/**
 * Plugin for adding a close context menu to tabs. Note that the menu respects
 * the closable configuration on the tab. As such, commands like remove others
 * and remove all will not remove items that are not closable.
 */
Ext.define('Ext.ux.TabCloseMenu', {
    extend: 'Ext.plugin.Abstract',

    alias: 'plugin.tabclosemenu',

    mixins: {
        observable: 'Ext.util.Observable'
    },

    /**
     * @cfg {String} closeTabText
     * The text for closing the current tab.
     */
    closeTabText: 'Close Tab',

    /**
     * @cfg {Boolean} showCloseOthers
     * Indicates whether to show the 'Close Others' option.
     */
    showCloseOthers: true,

    /**
     * @cfg {String} closeOthersTabsText
     * The text for closing all tabs except the current one.
     */
    closeOthersTabsText: 'Close Other Tabs',

    /**
     * @cfg {Boolean} showCloseAll
     * Indicates whether to show the 'Close All' option.
     */
    showCloseAll: true,

    /**
     * @cfg {String} closeAllTabsText
     * The text for closing all tabs.
     */
    closeAllTabsText: 'Close All Tabs',

    /**
     * @cfg {Array} extraItemsHead
     * An array of additional context menu items to add to the front of the context menu.
     */
    extraItemsHead: null,

    /**
     * @cfg {Array} extraItemsTail
     * An array of additional context menu items to add to the end of the context menu.
     */
    extraItemsTail: null,

    // TODO - doc this.addEvents('aftermenu','beforemenu');

    //public
    constructor: function (config) {
        this.callParent([config]);
        this.mixins.observable.constructor.call(this, config);
    },

    init : function(tabpanel){
        this.tabPanel = tabpanel;
        this.tabBar = tabpanel.down("tabbar");

        this.mon(this.tabPanel, {
            scope: this,
            afterlayout: this.onAfterLayout,
            single: true
        });
    },

    onAfterLayout: function() {
        this.mon(this.tabBar.el, {
            scope: this,
            contextmenu: this.onContextMenu,
            delegate: '.x-tab'
        });
    },

    destroy : function(){
        this.callParent();
        Ext.destroy(this.menu);
    },

    // private
    onContextMenu : function(event, target){
        var me = this,
            menu = me.createMenu(),
            disableAll = true,
            disableOthers = true,
            tab = me.tabBar.getChildByElement(target),
            index = me.tabBar.items.indexOf(tab);

        me.item = me.tabPanel.getComponent(index);
        menu.child('#close').setDisabled(!me.item.closable);

        if (me.showCloseAll || me.showCloseOthers) {
            me.tabPanel.items.each(function(item) {
                if (item.closable) {
                    disableAll = false;
                    if (item !== me.item) {
                        disableOthers = false;
                        return false;
                    }
                }
                return true;
            });

            if (me.showCloseAll) {
                menu.child('#closeAll').setDisabled(disableAll);
            }

            if (me.showCloseOthers) {
                menu.child('#closeOthers').setDisabled(disableOthers);
            }
        }

        event.preventDefault();
        me.fireEvent('beforemenu', menu, me.item, me);

        menu.showAt(event.getXY());
    },

    createMenu : function() {
        var me = this;

        if (!me.menu) {
            var items = [{
                itemId: 'close',
                text: me.closeTabText,
                scope: me,
                handler: me.onClose
            }];

            if (me.showCloseAll || me.showCloseOthers) {
                items.push('-');
            }

            if (me.showCloseOthers) {
                items.push({
                    itemId: 'closeOthers',
                    text: me.closeOthersTabsText,
                    scope: me,
                    handler: me.onCloseOthers
                });
            }

            if (me.showCloseAll) {
                items.push({
                    itemId: 'closeAll',
                    text: me.closeAllTabsText,
                    scope: me,
                    handler: me.onCloseAll
                });
            }

            if (me.extraItemsHead) {
                items = me.extraItemsHead.concat(items);
            }

            if (me.extraItemsTail) {
                items = items.concat(me.extraItemsTail);
            }

            me.menu = Ext.create('Ext.menu.Menu', {
                items: items,
                listeners: {
                    hide: me.onHideMenu,
                    scope: me
                }
            });
        }

        return me.menu;
    },

    onHideMenu: function () {
        var me = this;
        me.fireEvent('aftermenu', me.menu, me);
    },

    onClose : function(){
        this.tabPanel.remove(this.item);
    },

    onCloseOthers : function(){
        this.doClose(true);
    },

    onCloseAll : function(){
        this.doClose(false);
    },

    doClose : function(excludeActive){
        var items = [];

        this.tabPanel.items.each(function(item){
            if(item.closable){
                if(!excludeActive || item !== this.item){
                    items.push(item);
                }
            }
        }, this);

        Ext.suspendLayouts();
        Ext.Array.forEach(items, function(item){
            this.tabPanel.remove(item);
        }, this);
        Ext.resumeLayouts(true);
    }
});
/**
 * UX used to provide a spotlight around a specified component/element.
 */
Ext.define('Ext.ux.Spotlight', {
    /**
     * @private
     * The baseCls for the spotlight elements
     */
    baseCls: 'x-spotlight',

    /**
     * @cfg animate {Boolean} True to animate the spotlight change
     * (defaults to true)
     */
    animate: true,

    /**
     * @cfg duration {Integer} The duration of the animation, in milliseconds
     * (defaults to 250)
     */
    duration: 250,

    /**
     * @cfg easing {String} The type of easing for the spotlight animatation
     * (defaults to null)
     */
    easing: null,

    /**
     * @private
     * True if the spotlight is active on the element
     */
    active: false,
    
    constructor: function(config){
        Ext.apply(this, config);
    },

    /**
     * Create all the elements for the spotlight
     */
    createElements: function() {
        var me = this,
            baseCls = me.baseCls,
            body = Ext.getBody();

        me.right = body.createChild({
            cls: baseCls
        });
        me.left = body.createChild({
            cls: baseCls
        });
        me.top = body.createChild({
            cls: baseCls
        });
        me.bottom = body.createChild({
            cls: baseCls
        });

        me.all = Ext.create('Ext.CompositeElement', [me.right, me.left, me.top, me.bottom]);
    },

    /**
     * Show the spotlight
     */
    show: function(el, callback, scope) {
        var me = this;
        
        //get the target element
        me.el = Ext.get(el);

        //create the elements if they don't already exist
        if (!me.right) {
            me.createElements();
        }

        if (!me.active) {
            //if the spotlight is not active, show it
            me.all.setDisplayed('');
            me.active = true;
            Ext.on('resize', me.syncSize, me);
            me.applyBounds(me.animate, false);
        } else {
            //if the spotlight is currently active, just move it
            me.applyBounds(false, false);
        }
    },

    /**
     * Hide the spotlight
     */
    hide: function(callback, scope) {
        var me = this;
        
        Ext.un('resize', me.syncSize, me);

        me.applyBounds(me.animate, true);
    },

    /**
     * Resizes the spotlight with the window size.
     */
    syncSize: function() {
        this.applyBounds(false, false);
    },

    /**
     * Resizes the spotlight depending on the arguments
     * @param {Boolean} animate True to animate the changing of the bounds
     * @param {Boolean} reverse True to reverse the animation
     */
    applyBounds: function(animate, reverse) {
        var me = this,
            box = me.el.getBox(),
            //get the current view width and height
            viewWidth = Ext.Element.getViewportWidth(),
            viewHeight = Ext.Element.getViewportHeight(),
            i = 0,
            config = false,
            from, to, clone;
            
        //where the element should start (if animation)
        from = {
            right: {
                x: box.right,
                y: viewHeight,
                width: (viewWidth - box.right),
                height: 0
            },
            left: {
                x: 0,
                y: 0,
                width: box.x,
                height: 0
            },
            top: {
                x: viewWidth,
                y: 0,
                width: 0,
                height: box.y
            },
            bottom: {
                x: 0,
                y: (box.y + box.height),
                width: 0,
                height: (viewHeight - (box.y + box.height)) + 'px'
            }
        };

        //where the element needs to finish
        to = {
            right: {
                x: box.right,
                y: box.y,
                width: (viewWidth - box.right) + 'px',
                height: (viewHeight - box.y) + 'px'
            },
            left: {
                x: 0,
                y: 0,
                width: box.x + 'px',
                height: (box.y + box.height) + 'px'
            },
            top: {
                x: box.x,
                y: 0,
                width: (viewWidth - box.x) + 'px',
                height: box.y + 'px'
            },
            bottom: {
                x: 0,
                y: (box.y + box.height),
                width: (box.x + box.width) + 'px',
                height: (viewHeight - (box.y + box.height)) + 'px'
            }
        };

        //reverse the objects
        if (reverse) {
            clone = Ext.clone(from);
            from = to;
            to = clone;
        }

        if (animate) {
            Ext.Array.forEach(['right', 'left', 'top', 'bottom'], function(side) {
                me[side].setBox(from[side]);
                me[side].animate({
                    duration: me.duration,
                    easing: me.easing,
                    to: to[side]
                });
            },
            this);
        } else {
            Ext.Array.forEach(['right', 'left', 'top', 'bottom'], function(side) {
                me[side].setBox(Ext.apply(from[side], to[side]));
                me[side].repaint();
            },
            this);
        }
    },

    /**
     * Removes all the elements for the spotlight
     */
    destroy: function() {
        var me = this;
        
        Ext.destroy(me.right, me.left, me.top, me.bottom);
        delete me.el;
        delete me.all;
    }
});
/**
 * Plugin for PagingToolbar which replaces the textfield input with a slider
 */
Ext.define('Ext.ux.SlidingPager', {
    requires: [
        'Ext.slider.Single',
        'Ext.slider.Tip'
    ],

    /**
     * Creates new SlidingPager.
     * @param {Object} config Configuration options
     */
    constructor : function(config) {
        if (config) {
            Ext.apply(this, config);
        }
    },

    init : function(pbar){
        var idx = pbar.items.indexOf(pbar.child("#inputItem")),
            slider;

        Ext.each(pbar.items.getRange(idx - 2, idx + 2), function(c){
            c.hide();
        });

        slider = Ext.create('Ext.slider.Single', {
            width: 114,
            minValue: 1,
            maxValue: 1,
            hideLabel: true,
            tipText: function(thumb) {
                return Ext.String.format('Page <b>{0}</b> of <b>{1}</b>', thumb.value, thumb.slider.maxValue);
            },
            listeners: {
                changecomplete: function(s, v){
                    pbar.store.loadPage(v);
                }
            }
        });

        pbar.insert(idx + 1, slider);

        pbar.on({
            change: function(pb, data){
                slider.setMaxValue(data.pageCount);
                slider.setValue(data.currentPage);
            }
        });
    }
});
/**
 * @deprecated
 * Ext.ux.RowExpander has been promoted to the core framework. Use
 * {@link Ext.grid.plugin.RowExpander} instead.  Ext.ux.RowExpander is now just an empty
 * stub that extends Ext.grid.plugin.RowExpander for backward compatibility reasons.
 */
Ext.define('Ext.ux.RowExpander', {
    extend: 'Ext.grid.plugin.RowExpander'
});/**
 * Plugin for displaying a progressbar inside of a paging toolbar
 * instead of plain text.
 */
Ext.define('Ext.ux.ProgressBarPager', {

    requires: ['Ext.ProgressBar'],
    /**
     * @cfg {Number} width
     * <p>The default progress bar width.  Default is 225.</p>
    */
    width   : 225,
    /**
     * @cfg {String} defaultText
    * <p>The text to display while the store is loading.  Default is 'Loading...'</p>
     */
    defaultText    : 'Loading...',
    /**
     * @cfg {Object} defaultAnimCfg
     * <p>A {@link Ext.fx.Anim Ext.fx.Anim} configuration object.</p>
     */
    defaultAnimCfg : {
		duration: 1000,
		easing: 'bounceOut'	
	},	

    /**
     * Creates new ProgressBarPager.
     * @param {Object} config Configuration options
     */
    constructor : function(config) {
        if (config) {
            Ext.apply(this, config);
        }
    },
    //public
    init : function (parent) {
        var displayItem;
        if (parent.displayInfo) {
            this.parent = parent;

            displayItem = parent.child("#displayItem");
            if (displayItem) {
                parent.remove(displayItem, true);
            }

            this.progressBar = Ext.create('Ext.ProgressBar', {
                text    : this.defaultText,
                width   : this.width,
                animate : this.defaultAnimCfg,
                style: {
                    cursor: 'pointer'
                },
                listeners: {
                    el: {
                        scope: this,
                        click: this.handleProgressBarClick
                    }
                }
            });

            parent.displayItem = this.progressBar;

            parent.add(parent.displayItem);
            Ext.apply(parent, this.parentOverrides);
        }
    },
    // private
    // This method handles the click for the progress bar
    handleProgressBarClick : function(e){
        var parent = this.parent,
            displayItem = parent.displayItem,
            box = this.progressBar.getBox(),
            xy = e.getXY(),
            position = xy[0]- box.x,
            pages = Math.ceil(parent.store.getTotalCount() / parent.pageSize),
            newPage = Math.max(Math.ceil(position / (displayItem.width / pages)), 1);

        parent.store.loadPage(newPage);
    },

    // private, overriddes
    parentOverrides  : {
        // private
        // This method updates the information via the progress bar.
        updateInfo : function(){
            if(this.displayItem){
                var count = this.store.getCount(),
                    pageData = this.getPageData(),
                    message = count === 0 ?
                    this.emptyMsg :
                    Ext.String.format(
                        this.displayMsg,
                        pageData.fromRecord, pageData.toRecord, this.store.getTotalCount()
                    ),
                    percentage = pageData.pageCount > 0 ? (pageData.currentPage / pageData.pageCount) : 0;

                this.displayItem.updateProgress(percentage, message, this.animate || this.defaultAnimConfig);
            }
        }
    }
});

/**
 * The Preview Plugin enables toggle of a configurable preview of all visible records.
 *
 * Note: This plugin does NOT assert itself against an existing RowBody feature and may conflict with
 * another instance of the same plugin.
 */
Ext.define('Ext.ux.PreviewPlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.preview',
    requires: ['Ext.grid.feature.RowBody'],
    
    // private, css class to use to hide the body
    hideBodyCls: 'x-grid-row-body-hidden',
    
    /**
     * @cfg {String} bodyField
     * Field to display in the preview. Must be a field within the Model definition
     * that the store is using.
     */
    bodyField: '',
    
    /**
     * @cfg {Boolean} previewExpanded
     */
    previewExpanded: true,

    /**
     * Plugin may be safely declared on either a panel.Grid or a Grid View/viewConfig
     * @param {Ext.grid.Panel/Ext.view.View} target
     */
    setCmp: function(target) {
        this.callParent(arguments);

        // Resolve grid from view as necessary
        var me = this,
            grid        = me.cmp = target.isXType('gridview') ? target.grid : target,
            bodyField   = me.bodyField,
            hideBodyCls = me.hideBodyCls,
            feature     = Ext.create('Ext.grid.feature.RowBody', {
                grid : grid,
                getAdditionalData: function(data, idx, model, rowValues) {

                    var getAdditionalData = Ext.grid.feature.RowBody.prototype.getAdditionalData,
                        additionalData = {
                            rowBody: data[bodyField],
                            rowBodyCls: grid.getView().previewExpanded ? '' : hideBodyCls
                        };

                    if (Ext.isFunction(getAdditionalData)) {
                        // "this" is the RowBody object hjere. Do not change to "me"
                        Ext.apply(additionalData, getAdditionalData.apply(this, arguments));
                    }
                    return additionalData;
                }
            }),
            initFeature = function(grid, view) {
                view.previewExpanded = me.previewExpanded;

                // By this point, existing features are already in place, so this must be initialized and added
                view.featuresMC.add(feature);
                feature.init(grid);
            };

        // The grid has already created its view
        if (grid.view) {
            initFeature(grid, grid.view);
        }

        // At the time a grid creates its plugins, it has not created all the things
        // it needs to create its view correctly.
        // Process the view and init the RowBody Feature as soon as the view is created.
        else {
            grid.on({
                viewcreated: initFeature,
                single: true
            });
        }
    },

    /**
     * Toggle between the preview being expanded/hidden on all rows
     * @param {Boolean} expanded Pass true to expand the record and false to not show the preview.
     */
    toggleExpanded: function(expanded) {
        var grid = this.getCmp(),
            view = grid && grid.getView(),
            bufferedRenderer = view.bufferedRenderer,
            scrollManager = view.scrollManager;

        if (grid && view && expanded !== view.previewExpanded ) {
            this.previewExpanded = view.previewExpanded = !!expanded;
            view.refreshView();

            // If we are using the touch scroller, ensure that the scroller knows about
            // the correct scrollable range
            if (scrollManager) {
                if (bufferedRenderer) {
                    bufferedRenderer.stretchView(view, bufferedRenderer.getScrollHeight(true));
                } else {
                    scrollManager.refresh(true);
                }
            }
        }
    }
});
/**
 * A GridPanel class with live search support.
 * @author Nicolas Ferrero
 */
Ext.define('Ext.ux.LiveSearchGridPanel', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Ext.toolbar.TextItem',
        'Ext.form.field.Checkbox',
        'Ext.form.field.Text',
        'Ext.ux.statusbar.StatusBar'
    ],
    
    /**
     * @private
     * search value initialization
     */
    searchValue: null,
    
    /**
     * @private
     * The row indexes where matching strings are found. (used by previous and next buttons)
     */
    indexes: [],
    
    /**
     * @private
     * The row index of the first search, it could change if next or previous buttons are used.
     */
    currentIndex: null,
    
    /**
     * @private
     * The generated regular expression used for searching.
     */
    searchRegExp: null,
    
    /**
     * @private
     * Case sensitive mode.
     */
    caseSensitive: false,
    
    /**
     * @private
     * Regular expression mode.
     */
    regExpMode: false,
    
    /**
     * @cfg {String} matchCls
     * The matched string css classe.
     */
    matchCls: 'x-livesearch-match',
    
    defaultStatusText: 'Nothing Found',
    
    // Component initialization override: adds the top and bottom toolbars and setup headers renderer.
    initComponent: function() {
        var me = this;
        me.tbar = ['Search',{
                 xtype: 'textfield',
                 name: 'searchField',
                 hideLabel: true,
                 width: 200,
                 listeners: {
                     change: {
                         fn: me.onTextFieldChange,
                         scope: this,
                         buffer: 500
                     }
                 }
            }, {
                xtype: 'button',
                text: '&lt;',
                tooltip: 'Find Previous Row',
                handler: me.onPreviousClick,
                scope: me
            },{
                xtype: 'button',
                text: '&gt;',
                tooltip: 'Find Next Row',
                handler: me.onNextClick,
                scope: me
            }, '-', {
                xtype: 'checkbox',
                hideLabel: true,
                margin: '0 0 0 4px',
                handler: me.regExpToggle,
                scope: me                
            }, 'Regular expression', {
                xtype: 'checkbox',
                hideLabel: true,
                margin: '0 0 0 4px',
                handler: me.caseSensitiveToggle,
                scope: me
            }, 'Case sensitive'];

        me.bbar = Ext.create('Ext.ux.StatusBar', {
            defaultText: me.defaultStatusText,
            name: 'searchStatusBar'
        });
        
        me.callParent(arguments);
    },
    
    // afterRender override: it adds textfield and statusbar reference and start monitoring keydown events in textfield input 
    afterRender: function() {
        var me = this;
        me.callParent(arguments);
        me.textField = me.down('textfield[name=searchField]');
        me.statusBar = me.down('statusbar[name=searchStatusBar]');
    },
    // detects html tag
    tagsRe: /<[^>]*>/gm,
    
    // DEL ASCII code
    tagsProtect: '\x0f',
    
    /**
     * In normal mode it returns the value with protected regexp characters.
     * In regular expression mode it returns the raw value except if the regexp is invalid.
     * @return {String} The value to process or null if the textfield value is blank or invalid.
     * @private
     */
    getSearchValue: function() {
        var me = this,
            value = me.textField.getValue();
            
        if (value === '') {
            return null;
        }
        if (!me.regExpMode) {
            value = Ext.String.escapeRegex(value);
        } else {
            try {
                new RegExp(value);
            } catch (error) {
                me.statusBar.setStatus({
                    text: error.message,
                    iconCls: 'x-status-error'
                });
                return null;
            }
            // this is stupid
            if (value === '^' || value === '$') {
                return null;
            }
        }

        return value;
    },
    
    /**
     * Finds all strings that matches the searched value in each grid cells.
     * @private
     */
     onTextFieldChange: function() {
         var me = this,
             count = 0,
             view = me.view,
             cellSelector = view.cellSelector,
             innerSelector = view.innerSelector;

         view.refresh();
         // reset the statusbar
         me.statusBar.setStatus({
             text: me.defaultStatusText,
             iconCls: ''
         });

         me.searchValue = me.getSearchValue();
         me.indexes = [];
         me.currentIndex = null;

         if (me.searchValue !== null) {
             me.searchRegExp = new RegExp(me.getSearchValue(), 'g' + (me.caseSensitive ? '' : 'i'));
             
             
             me.store.each(function(record, idx) {
                 var td = Ext.fly(view.getNode(idx)).down(cellSelector),
                     cell, matches, cellHTML;
                 while (td) {
                     cell = td.down(innerSelector);
                     matches = cell.dom.innerHTML.match(me.tagsRe);
                     cellHTML = cell.dom.innerHTML.replace(me.tagsRe, me.tagsProtect);
                     
                     // populate indexes array, set currentIndex, and replace wrap matched string in a span
                     cellHTML = cellHTML.replace(me.searchRegExp, function(m) {
                        count += 1;
                        if (Ext.Array.indexOf(me.indexes, idx) === -1) {
                            me.indexes.push(idx);
                        }
                        if (me.currentIndex === null) {
                            me.currentIndex = idx;
                        }
                        return '<span class="' + me.matchCls + '">' + m + '</span>';
                     });
                     // restore protected tags
                     Ext.each(matches, function(match) {
                        cellHTML = cellHTML.replace(me.tagsProtect, match); 
                     });
                     // update cell html
                     cell.dom.innerHTML = cellHTML;
                     td = td.next();
                 }
             }, me);

             // results found
             if (me.currentIndex !== null) {
                 me.getSelectionModel().select(me.currentIndex);
                 me.statusBar.setStatus({
                     text: count + ' matche(s) found.',
                     iconCls: 'x-status-valid'
                 });
             }
         }

         // no results found
         if (me.currentIndex === null) {
             me.getSelectionModel().deselectAll();
         }

         me.textField.focus();
     },
    
    /**
     * Selects the previous row containing a match.
     * @private
     */   
    onPreviousClick: function() {
        var me = this,
            idx;
            
        if ((idx = Ext.Array.indexOf(me.indexes, me.currentIndex)) !== -1) {
            me.currentIndex = me.indexes[idx - 1] || me.indexes[me.indexes.length - 1];
            me.getSelectionModel().select(me.currentIndex);
         }
    },
    
    /**
     * Selects the next row containing a match.
     * @private
     */    
    onNextClick: function() {
         var me = this,
             idx;
             
         if ((idx = Ext.Array.indexOf(me.indexes, me.currentIndex)) !== -1) {
            me.currentIndex = me.indexes[idx + 1] || me.indexes[0];
            me.getSelectionModel().select(me.currentIndex);
         }
    },
    
    /**
     * Switch to case sensitive mode.
     * @private
     */    
    caseSensitiveToggle: function(checkbox, checked) {
        this.caseSensitive = checked;
        this.onTextFieldChange();
    },
    
    /**
     * Switch to regular expression mode
     * @private
     */
    regExpToggle: function(checkbox, checked) {
        this.regExpMode = checked;
        this.onTextFieldChange();
    }
});/**
 * Barebones iframe implementation. 
 */
Ext.define('Ext.ux.IFrame', {
    extend: 'Ext.Component',

    alias: 'widget.uxiframe',

    loadMask: 'Loading...',

    src: 'about:blank',

    renderTpl: [
        '<iframe src="{src}" id="{id}-iframeEl" data-ref="iframeEl" name="{frameName}" width="100%" height="100%" frameborder="0"></iframe>'
    ],
    childEls: ['iframeEl'],

    initComponent: function () {
        this.callParent();

        this.frameName = this.frameName || this.id + '-frame';
    },

    initEvents : function() {
        var me = this;
        me.callParent();
        me.iframeEl.on('load', me.onLoad, me);
    },

    initRenderData: function() {
        return Ext.apply(this.callParent(), {
            src: this.src,
            frameName: this.frameName
        });
    },

    getBody: function() {
        var doc = this.getDoc();
        return doc.body || doc.documentElement;
    },

    getDoc: function() {
        try {
            return this.getWin().document;
        } catch (ex) {
            return null;
        }
    },

    getWin: function() {
        var me = this,
            name = me.frameName,
            win = Ext.isIE
                ? me.iframeEl.dom.contentWindow
                : window.frames[name];
        return win;
    },

    getFrame: function() {
        var me = this;
        return me.iframeEl.dom;
    },

    beforeDestroy: function () {
        this.cleanupListeners(true);
        this.callParent();
    },
    
    cleanupListeners: function(destroying){
        var doc, prop;

        if (this.rendered) {
            try {
                doc = this.getDoc();
                if (doc) {
                    Ext.get(doc).un(this._docListeners);
                    if (destroying) {
                        for (prop in doc) {
                            if (doc.hasOwnProperty && doc.hasOwnProperty(prop)) {
                                delete doc[prop];
                            }
                        }
                    }
                }
            } catch(e) { }
        }
    },

    onLoad: function() {
        var me = this,
            doc = me.getDoc(),
            fn = me.onRelayedEvent;

        if (doc) {
            try {
                // These events need to be relayed from the inner document (where they stop
                // bubbling) up to the outer document. This has to be done at the DOM level so
                // the event reaches listeners on elements like the document body. The effected
                // mechanisms that depend on this bubbling behavior are listed to the right
                // of the event.
                Ext.get(doc).on(
                    me._docListeners = {
                        mousedown: fn, // menu dismisal (MenuManager) and Window onMouseDown (toFront)
                        mousemove: fn, // window resize drag detection
                        mouseup: fn,   // window resize termination
                        click: fn,     // not sure, but just to be safe
                        dblclick: fn,  // not sure again
                        scope: me
                    }
                );
            } catch(e) {
                // cannot do this xss
            }

            // We need to be sure we remove all our events from the iframe on unload or we're going to LEAK!
            Ext.get(this.getWin()).on('beforeunload', me.cleanupListeners, me);

            this.el.unmask();
            this.fireEvent('load', this);

        } else if (me.src) {

            this.el.unmask();
            this.fireEvent('error', this);
        }


    },

    onRelayedEvent: function (event) {
        // relay event from the iframe's document to the document that owns the iframe...

        var iframeEl = this.iframeEl,

            // Get the left-based iframe position
            iframeXY = iframeEl.getTrueXY(),
            originalEventXY = event.getXY(),

            // Get the left-based XY position.
            // This is because the consumer of the injected event will
            // perform its own RTL normalization.
            eventXY = event.getTrueXY();

        // the event from the inner document has XY relative to that document's origin,
        // so adjust it to use the origin of the iframe in the outer document:
        event.xy = [iframeXY[0] + eventXY[0], iframeXY[1] + eventXY[1]];

        event.injectEvent(iframeEl); // blame the iframe for the event...

        event.xy = originalEventXY; // restore the original XY (just for safety)
    },

    load: function (src) {
        var me = this,
            text = me.loadMask,
            frame = me.getFrame();

        if (me.fireEvent('beforeload', me, src) !== false) {
            if (text && me.el) {
                me.el.mask(text);
            }

            frame.src = me.src = (src || me.src);
        }
    }
});

/*
 * TODO items:
 *
 * Iframe should clean up any Ext.dom.Element wrappers around its window, document
 * documentElement and body when it is destroyed.  This helps prevent "Permission Denied"
 * errors in IE when Ext.dom.GarbageCollector tries to access those objects on an orphaned
 * iframe.  Permission Denied errors can occur in one of the following 2 scenarios:
 *
 *     a. When an iframe is removed from the document, and all references to it have been
 *     removed, IE will "clear" the window object.  At this point the window object becomes
 *     completely inaccessible - accessing any of its properties results in a "Permission
 *     Denied" error. http://msdn.microsoft.com/en-us/library/ie/hh180174(v=vs.85).aspx
 *
 *     b. When an iframe is unloaded (either by navigating to a new url, or via document.open/
 *     document.write, new html and body elements are created and the old the html and body
 *     elements are orphaned.  Accessing the html and body elements or any of their properties
 *     results in a "Permission Denied" error.
 */


/**
* Allows GroupTab to render a table structure.
*/
Ext.define('Ext.ux.GroupTabRenderer', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.grouptabrenderer',

    tableTpl: new Ext.XTemplate(
        '<div id="{view.id}-body" class="' + Ext.baseCSSPrefix + '{view.id}-table ' + Ext.baseCSSPrefix + 'grid-table-resizer" style="{tableStyle}">',
            '{%',
                'values.view.renderRows(values.rows, values.viewStartIndex, out);',
            '%}',
        '</div>',
        {
            priority: 5
        }
    ),

    rowTpl: new Ext.XTemplate(
        '{%',
            'Ext.Array.remove(values.itemClasses, "', Ext.baseCSSPrefix + 'grid-row");',
            'var dataRowCls = values.recordIndex === -1 ? "" : " ' + Ext.baseCSSPrefix + 'grid-data-row";',
        '%}',
        '<div {[values.rowId ? ("id=\\"" + values.rowId + "\\"") : ""]} ',
            'data-boundView="{view.id}" ',
            'data-recordId="{record.internalId}" ',
            'data-recordIndex="{recordIndex}" ',
            'class="' + Ext.baseCSSPrefix + 'grouptab-row {[values.itemClasses.join(" ")]} {[values.rowClasses.join(" ")]}{[dataRowCls]}" ',
            '{rowAttr:attributes}>',
            '<tpl for="columns">' +
                '{%',
                    'parent.view.renderCell(values, parent.record, parent.recordIndex, parent.rowIndex, xindex - 1, out, parent)',
                 '%}',
            '</tpl>',
        '</div>',
        {
            priority: 5
        }
    ),

    cellTpl: new Ext.XTemplate(
        '{%values.tdCls = values.tdCls.replace(" ' + Ext.baseCSSPrefix + 'grid-cell "," ");%}',
        '<div class="' + Ext.baseCSSPrefix + 'grouptab-cell {tdCls}" {tdAttr}>',
            '<div {unselectableAttr} class="' + Ext.baseCSSPrefix + 'grid-cell-inner" style="text-align: {align}; {style};">{value}</div>',
            '<div class="x-grouptabs-corner x-grouptabs-corner-top-left"></div>',
            '<div class="x-grouptabs-corner x-grouptabs-corner-bottom-left"></div>',
        '</div>',
        {
            priority: 5
        }
    ),

    selectors: {
        // Outer table
        bodySelector: 'div.' + Ext.baseCSSPrefix + 'grid-table-resizer',

        // Element which contains rows
        nodeContainerSelector: 'div.' + Ext.baseCSSPrefix + 'grid-table-resizer',

        // row
        itemSelector: 'div.' + Ext.baseCSSPrefix + 'grouptab-row',

        // row which contains cells as opposed to wrapping rows
        rowSelector: 'div.' + Ext.baseCSSPrefix + 'grouptab-row',

        // cell
        cellSelector: 'div.' + Ext.baseCSSPrefix + 'grouptab-cell', 

        getCellSelector: function(header) {
            return header ? header.getCellSelector() : this.cellSelector; 
        }

    },

    init: function(grid) {
        var view = grid.getView(), 
            me = this;
        view.addTpl(me.tableTpl);
        view.addRowTpl(me.rowTpl);
        view.addCellTpl(me.cellTpl);
        Ext.apply(view, me.selectors);
    }
});



/**
 * @author Nicolas Ferrero
 * A TabPanel with grouping support.
 */
Ext.define('Ext.ux.GroupTabPanel', {
    extend: 'Ext.Container',

    alias: 'widget.grouptabpanel',

    requires:[
        'Ext.tree.Panel',
        'Ext.ux.GroupTabRenderer'
    ],

    baseCls : Ext.baseCSSPrefix + 'grouptabpanel',

    /**
     * @event beforetabchange
     * Fires before a tab change (activated by {@link #setActiveTab}). Return false in any listener to cancel
     * the tabchange
     * @param {Ext.ux.GroupTabPanel} grouptabPanel The GroupTabPanel
     * @param {Ext.Component} newCard The card that is about to be activated
     * @param {Ext.Component} oldCard The card that is currently active
     */

    /**
     * @event tabchange
     * Fires when a new tab has been activated (activated by {@link #setActiveTab}).
     * @param {Ext.ux.GroupTabPanel} grouptabPanel The GroupTabPanel
     * @param {Ext.Component} newCard The newly activated item
     * @param {Ext.Component} oldCard The previously active item
     */

    /**
     * @event beforegroupchange
     * Fires before a group change (activated by {@link #setActiveGroup}). Return false in any listener to cancel
     * the groupchange
     * @param {Ext.ux.GroupTabPanel} grouptabPanel The GroupTabPanel
     * @param {Ext.Component} newGroup The root group card that is about to be activated
     * @param {Ext.Component} oldGroup The root group card that is currently active
     */

    /**
     * @event groupchange
     * Fires when a new group has been activated (activated by {@link #setActiveGroup}).
     * @param {Ext.ux.GroupTabPanel} grouptabPanel The GroupTabPanel
     * @param {Ext.Component} newGroup The newly activated root group item
     * @param {Ext.Component} oldGroup The previously active root group item
     */

    initComponent: function(config) {
        var me = this;

        Ext.apply(me, config);

        // Processes items to create the TreeStore and also set up
        // "this.cards" containing the actual card items.
        me.store = me.createTreeStore();

        me.layout = {
            type: 'hbox',
            align: 'stretch'
        };
        me.defaults = {
            border: false
        };

        me.items = [{
            xtype: 'treepanel',
            cls: 'x-tree-panel x-grouptabbar',
            width: 150,
            rootVisible: false,
            store: me.store,
            hideHeaders: true,
            animate: false,
            processEvent: Ext.emptyFn,
            border: false,
            plugins: [{
                ptype: 'grouptabrenderer'
            }],
            viewConfig: {
                overItemCls: '',
                getRowClass: me.getRowClass
            },
            columns: [{
                xtype: 'treecolumn',
                sortable: false,
                dataIndex: 'text',
                flex: 1,
                renderer: function (value, cell, node, idx1, idx2, store, tree) {
                    var cls = '';

                    if (node.parentNode && node.parentNode.parentNode === null) {
                        cls += ' x-grouptab-first';
                        if (node.previousSibling) {
                            cls += ' x-grouptab-prev';
                        }
                        if (!node.get('expanded') || node.firstChild == null) {
                            cls += ' x-grouptab-last';
                        }
                    } else if (node.nextSibling === null) {
                        cls += ' x-grouptab-last';
                    } else {
                        cls += ' x-grouptab-center';
                    }
                    if (node.data.activeTab) {
                        cls += ' x-active-tab';
                    }
                    cell.tdCls= 'x-grouptab'+ cls;

                    return value;
                }
             }]
        }, {
            xtype: 'container',
            flex: 1,
            layout: 'card',
            activeItem: me.mainItem,
            baseCls: Ext.baseCSSPrefix + 'grouptabcontainer',
            items: me.cards
        }];

        me.callParent(arguments);
        me.setActiveTab(me.activeTab);
        me.setActiveGroup(me.activeGroup);
        me.mon(me.down('treepanel').getSelectionModel(), 'select', me.onNodeSelect, me);
    },

    getRowClass: function(node, rowIndex, rowParams, store) {
        var cls = '';
        if (node.data.activeGroup) {
           cls += ' x-active-group';
        }
        return cls;
    },

    /**
     * @private
     * Node selection listener.
     */
    onNodeSelect: function (selModel, node) {
        var me = this,
            currentNode = me.store.getRootNode(),
            parent;

        if (node.parentNode && node.parentNode.parentNode === null) {
            parent = node;
        } else {
            parent = node.parentNode;
        }

        if (me.setActiveGroup(parent.get('id')) === false || me.setActiveTab(node.get('id')) === false) {
            return false;
        }

        while (currentNode) {
            currentNode.set('activeTab', false);
            currentNode.set('activeGroup', false);
            currentNode = currentNode.firstChild || currentNode.nextSibling || currentNode.parentNode.nextSibling;
        }

        parent.set('activeGroup', true);
        parent.eachChild(function(child) {
            child.set('activeGroup', true);
        });
        node.set('activeTab', true);
        selModel.view.refresh();
    },

    /**
     * Makes the given component active (makes it the visible card in the GroupTabPanel's CardLayout)
     * @param {Ext.Component} cmp The component to make active
     */
    setActiveTab: function(cmp) {
        var me = this,
            newTab = cmp,
            oldTab;

        if(Ext.isString(cmp)) {
            newTab = Ext.getCmp(newTab);
        }

        if (newTab === me.activeTab) {
            return false;
        }

        oldTab = me.activeTab;
        if (me.fireEvent('beforetabchange', me, newTab, oldTab) !== false) {
             me.activeTab = newTab;
             if (me.rendered) {
                 me.down('container[baseCls=' + Ext.baseCSSPrefix + 'grouptabcontainer' + ']').getLayout().setActiveItem(newTab);
             }
             me.fireEvent('tabchange', me, newTab, oldTab);
         }
         return true;
    },

    /**
     * Makes the given group active
     * @param {Ext.Component} cmp The root component to make active.
     */
    setActiveGroup: function(cmp) {
        var me = this,
            newGroup = cmp,
            oldGroup;

        if(Ext.isString(cmp)) {
            newGroup = Ext.getCmp(newGroup);
        }

        if (newGroup === me.activeGroup) {
            return true;
        }

        oldGroup = me.activeGroup;
        if (me.fireEvent('beforegroupchange', me, newGroup, oldGroup) !== false) {
             me.activeGroup = newGroup;
             me.fireEvent('groupchange', me, newGroup, oldGroup);
         } else {
             return false;
         }
         return true;
    },

    /**
     * @private
     * Creates the TreeStore used by the GroupTabBar.
     */
    createTreeStore: function() {
        var me = this,
            groups = me.prepareItems(me.items),
            data = {
                text: '.',
                children: []
            },
            cards = me.cards = [];
        me.activeGroup = me.activeGroup || 0;
        
        Ext.each(groups, function(groupItem, idx) {
            var leafItems = groupItem.items.items,
                rootItem = (leafItems[groupItem.mainItem] || leafItems[0]),
                groupRoot = {
                    children: []
                };

            // Create the root node of the group
            groupRoot.id = rootItem.id;
            groupRoot.text = rootItem.title;
            groupRoot.iconCls = rootItem.iconCls;

            groupRoot.expanded = true;
            groupRoot.activeGroup = (me.activeGroup === idx);
            groupRoot.activeTab = groupRoot.activeGroup ? true : false;
            if (groupRoot.activeTab) {
                me.activeTab = groupRoot.id;
            }

            if (groupRoot.activeGroup) {
                me.mainItem = groupItem.mainItem || 0;
                me.activeGroup = groupRoot.id;
            }

            Ext.each(leafItems, function(leafItem) {
                // First node has been done
                if (leafItem.id !== groupRoot.id) {
                    var child = {
                        id: leafItem.id,
                        leaf: true,
                        text: leafItem.title,
                        iconCls: leafItem.iconCls,
                        activeGroup: groupRoot.activeGroup,
                        activeTab: false
                    };
                    groupRoot.children.push(child);
                }

                // Ensure the items do not get headers
                delete leafItem.title;
                delete leafItem.iconCls;
                cards.push(leafItem);
            });

            data.children.push(groupRoot);
      });

       return Ext.create('Ext.data.TreeStore', {
            fields: ['id', 'text', 'activeGroup', 'activeTab'],
            root: {
                expanded: true
            },
            proxy: {
                type: 'memory',
                data: data
            }
        });
    },

    /**
     * Returns the item that is currently active inside this GroupTabPanel.
     * @return {Ext.Component/Number} The currently active item
     */
    getActiveTab: function() {
        return this.activeTab;
    },

    /**
     * Returns the root group item that is currently active inside this GroupTabPanel.
     * @return {Ext.Component/Number} The currently active root group item
     */
    getActiveGroup: function() {
        return this.activeGroup;
    }
});
/**
 * @author Shea Frederick
 *
 * The GMap Panel UX extends `Ext.panel.Panel` in order to display Google Maps.
 *
 * It is important to note that you must include the following Google Maps API above bootstrap.js in your 
 * application's index.html file (or equivilant).
 *
 *     <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?v=3&sensor=false"></script>
 *
 * It is important to note that due to the Google Maps loader, you cannot currently include
 * the above JS resource in the Cmd generated app.json file.  Doing so interferes with the loading of
 * Ext JS and Google Maps. 
 *
 * The following example creates a window containing a GMap Panel.  In this case, the center 
 * is set as geoCodeAddr, which is a string that Google translates into longitude and latitude.
 * 
 *     var mapwin = Ext.create('Ext.Window', {
 *         layout: 'fit',
 *         title: 'GMap Window',
 *         width: 450,
 *         height: 250,
 *         items: {
 *             xtype: 'gmappanel',
 *             gmapType: 'map',
 *             center: {
 *                 geoCodeAddr: "221B Baker Street",
 *                 marker: {
 *                     title: 'Holmes Home'
 *                 }
 *             },
 *             mapOptions : {
 *                 mapTypeId: google.maps.MapTypeId.ROADMAP
 *             }
 *         }
 *     }).show();
 * 
 */
Ext.define('Ext.ux.GMapPanel', {
    extend: 'Ext.panel.Panel',
    
    alias: 'widget.gmappanel',
    
    requires: ['Ext.window.MessageBox'],
    
    initComponent : function(){
        Ext.applyIf(this,{
            plain: true,
            gmapType: 'map',
            border: false
        });
        
        this.callParent();        
    },
    
    onBoxReady : function(){
        var center = this.center;
        this.callParent(arguments);       
        
        if (center) {
            if (center.geoCodeAddr) {
                this.lookupCode(center.geoCodeAddr, center.marker);
            } else {
                this.createMap(center);
            }
        } else {
            Ext.Error.raise('center is required');
        }
              
    },
    
    createMap: function(center, marker) {
        var options = Ext.apply({}, this.mapOptions);
        
        options = Ext.applyIf(options, {
            zoom: 14,
            center: center,
            mapTypeId: google.maps.MapTypeId.HYBRID
        });
        this.gmap = new google.maps.Map(this.body.dom, options);
        if (marker) {
            this.addMarker(Ext.applyIf(marker, {
                position: center
            }));
        }
        
        Ext.each(this.markers, this.addMarker, this);
        this.fireEvent('mapready', this, this.gmap);
    },
    
    addMarker: function(marker) {
        marker = Ext.apply({
            map: this.gmap
        }, marker);
        
        if (!marker.position) {
            marker.position = new google.maps.LatLng(marker.lat, marker.lng);
        }
        var o =  new google.maps.Marker(marker);
        Ext.Object.each(marker.listeners, function(name, fn){
            google.maps.event.addListener(o, name, fn);    
        });
        return o;
    },
    
    lookupCode : function(addr, marker) {
        this.geocoder = new google.maps.Geocoder();
        this.geocoder.geocode({
            address: addr
        }, Ext.Function.bind(this.onLookupComplete, this, [marker], true));
    },
    
    onLookupComplete: function(data, response, marker){
        if (response != 'OK') {
            Ext.MessageBox.alert('Error', 'An error occured: "' + response + '"');
            return;
        }
        this.createMap(data[0].geometry.location, marker);
    },
    
    afterComponentLayout : function(w, h){
        this.callParent(arguments);
        this.redraw();
    },
    
    redraw: function(){
        var map = this.gmap;
        if (map) {
            google.maps.event.trigger(map, 'resize');
        }
    }
 
});
/**
 * <p>A plugin for Field Components which creates clones of the Field for as
 * long as the user keeps filling them. Leaving the final one blank ends the repeating series.</p>
 * <p>Usage:</p>
 * <pre><code>
    {
        xtype: 'combo',
        plugins: [ Ext.ux.FieldReplicator ],
        triggerAction: 'all',
        fieldLabel: 'Select recipient',
        store: recipientStore
    }
 * </code></pre>
 */
Ext.define('Ext.ux.FieldReplicator', {
    alias: 'plugin.fieldreplicator',

    init: function(field) {
        // Assign the field an id grouping it with fields cloned from it. If it already
        // has an id that means it is itself a clone.
        if (!field.replicatorId) {
            field.replicatorId = Ext.id();
        }

        field.on('blur', this.onBlur, this);
    },

    onBlur: function(field) {
        var ownerCt = field.ownerCt,
            replicatorId = field.replicatorId,
            isEmpty = Ext.isEmpty(field.getRawValue()),
            siblings = ownerCt.query('[replicatorId=' + replicatorId + ']'),
            isLastInGroup = siblings[siblings.length - 1] === field,
            clone, idx;

        // If a field before the final one was blanked out, remove it
        if (isEmpty && !isLastInGroup) {
            Ext.Function.defer(field.destroy, 10, field); //delay to allow tab key to move focus first
        }
        // If the field is the last in the list and has a value, add a cloned field after it
        else if(!isEmpty && isLastInGroup) {
            if (field.onReplicate) {
                field.onReplicate();
            }
            clone = field.cloneConfig({replicatorId: replicatorId});
            idx = ownerCt.items.indexOf(field);
            ownerCt.add(idx + 1, clone);
        }
    }

});
