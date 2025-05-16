/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.synapse = (function() {

    /**
     * Namespace synapse.
     * @exports synapse
     * @namespace
     */
    var synapse = {};

    synapse.workflow = (function() {

        /**
         * Namespace workflow.
         * @memberof synapse
         * @namespace
         */
        var workflow = {};

        workflow.Position = (function() {

            /**
             * Properties of a Position.
             * @memberof synapse.workflow
             * @interface IPosition
             * @property {number|null} [x] Position x
             * @property {number|null} [y] Position y
             */

            /**
             * Constructs a new Position.
             * @memberof synapse.workflow
             * @classdesc Represents a Position.
             * @implements IPosition
             * @constructor
             * @param {synapse.workflow.IPosition=} [properties] Properties to set
             */
            function Position(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Position x.
             * @member {number} x
             * @memberof synapse.workflow.Position
             * @instance
             */
            Position.prototype.x = 0;

            /**
             * Position y.
             * @member {number} y
             * @memberof synapse.workflow.Position
             * @instance
             */
            Position.prototype.y = 0;

            /**
             * Creates a new Position instance using the specified properties.
             * @function create
             * @memberof synapse.workflow.Position
             * @static
             * @param {synapse.workflow.IPosition=} [properties] Properties to set
             * @returns {synapse.workflow.Position} Position instance
             */
            Position.create = function create(properties) {
                return new Position(properties);
            };

            /**
             * Encodes the specified Position message. Does not implicitly {@link synapse.workflow.Position.verify|verify} messages.
             * @function encode
             * @memberof synapse.workflow.Position
             * @static
             * @param {synapse.workflow.IPosition} message Position message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Position.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                    writer.uint32(/* id 1, wireType 5 =*/13).float(message.x);
                if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                    writer.uint32(/* id 2, wireType 5 =*/21).float(message.y);
                return writer;
            };

            /**
             * Encodes the specified Position message, length delimited. Does not implicitly {@link synapse.workflow.Position.verify|verify} messages.
             * @function encodeDelimited
             * @memberof synapse.workflow.Position
             * @static
             * @param {synapse.workflow.IPosition} message Position message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Position.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Position message from the specified reader or buffer.
             * @function decode
             * @memberof synapse.workflow.Position
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {synapse.workflow.Position} Position
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Position.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.synapse.workflow.Position();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.x = reader.float();
                            break;
                        }
                    case 2: {
                            message.y = reader.float();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Position message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof synapse.workflow.Position
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {synapse.workflow.Position} Position
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Position.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Position message.
             * @function verify
             * @memberof synapse.workflow.Position
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Position.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.x != null && message.hasOwnProperty("x"))
                    if (typeof message.x !== "number")
                        return "x: number expected";
                if (message.y != null && message.hasOwnProperty("y"))
                    if (typeof message.y !== "number")
                        return "y: number expected";
                return null;
            };

            /**
             * Creates a Position message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof synapse.workflow.Position
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {synapse.workflow.Position} Position
             */
            Position.fromObject = function fromObject(object) {
                if (object instanceof $root.synapse.workflow.Position)
                    return object;
                var message = new $root.synapse.workflow.Position();
                if (object.x != null)
                    message.x = Number(object.x);
                if (object.y != null)
                    message.y = Number(object.y);
                return message;
            };

            /**
             * Creates a plain object from a Position message. Also converts values to other types if specified.
             * @function toObject
             * @memberof synapse.workflow.Position
             * @static
             * @param {synapse.workflow.Position} message Position
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Position.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.x = 0;
                    object.y = 0;
                }
                if (message.x != null && message.hasOwnProperty("x"))
                    object.x = options.json && !isFinite(message.x) ? String(message.x) : message.x;
                if (message.y != null && message.hasOwnProperty("y"))
                    object.y = options.json && !isFinite(message.y) ? String(message.y) : message.y;
                return object;
            };

            /**
             * Converts this Position to JSON.
             * @function toJSON
             * @memberof synapse.workflow.Position
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Position.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Position
             * @function getTypeUrl
             * @memberof synapse.workflow.Position
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Position.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/synapse.workflow.Position";
            };

            return Position;
        })();

        workflow.Size = (function() {

            /**
             * Properties of a Size.
             * @memberof synapse.workflow
             * @interface ISize
             * @property {number|null} [width] Size width
             * @property {number|null} [height] Size height
             */

            /**
             * Constructs a new Size.
             * @memberof synapse.workflow
             * @classdesc Represents a Size.
             * @implements ISize
             * @constructor
             * @param {synapse.workflow.ISize=} [properties] Properties to set
             */
            function Size(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Size width.
             * @member {number} width
             * @memberof synapse.workflow.Size
             * @instance
             */
            Size.prototype.width = 0;

            /**
             * Size height.
             * @member {number} height
             * @memberof synapse.workflow.Size
             * @instance
             */
            Size.prototype.height = 0;

            /**
             * Creates a new Size instance using the specified properties.
             * @function create
             * @memberof synapse.workflow.Size
             * @static
             * @param {synapse.workflow.ISize=} [properties] Properties to set
             * @returns {synapse.workflow.Size} Size instance
             */
            Size.create = function create(properties) {
                return new Size(properties);
            };

            /**
             * Encodes the specified Size message. Does not implicitly {@link synapse.workflow.Size.verify|verify} messages.
             * @function encode
             * @memberof synapse.workflow.Size
             * @static
             * @param {synapse.workflow.ISize} message Size message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Size.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.width != null && Object.hasOwnProperty.call(message, "width"))
                    writer.uint32(/* id 1, wireType 5 =*/13).float(message.width);
                if (message.height != null && Object.hasOwnProperty.call(message, "height"))
                    writer.uint32(/* id 2, wireType 5 =*/21).float(message.height);
                return writer;
            };

            /**
             * Encodes the specified Size message, length delimited. Does not implicitly {@link synapse.workflow.Size.verify|verify} messages.
             * @function encodeDelimited
             * @memberof synapse.workflow.Size
             * @static
             * @param {synapse.workflow.ISize} message Size message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Size.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Size message from the specified reader or buffer.
             * @function decode
             * @memberof synapse.workflow.Size
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {synapse.workflow.Size} Size
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Size.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.synapse.workflow.Size();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.width = reader.float();
                            break;
                        }
                    case 2: {
                            message.height = reader.float();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Size message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof synapse.workflow.Size
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {synapse.workflow.Size} Size
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Size.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Size message.
             * @function verify
             * @memberof synapse.workflow.Size
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Size.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.width != null && message.hasOwnProperty("width"))
                    if (typeof message.width !== "number")
                        return "width: number expected";
                if (message.height != null && message.hasOwnProperty("height"))
                    if (typeof message.height !== "number")
                        return "height: number expected";
                return null;
            };

            /**
             * Creates a Size message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof synapse.workflow.Size
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {synapse.workflow.Size} Size
             */
            Size.fromObject = function fromObject(object) {
                if (object instanceof $root.synapse.workflow.Size)
                    return object;
                var message = new $root.synapse.workflow.Size();
                if (object.width != null)
                    message.width = Number(object.width);
                if (object.height != null)
                    message.height = Number(object.height);
                return message;
            };

            /**
             * Creates a plain object from a Size message. Also converts values to other types if specified.
             * @function toObject
             * @memberof synapse.workflow.Size
             * @static
             * @param {synapse.workflow.Size} message Size
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Size.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.width = 0;
                    object.height = 0;
                }
                if (message.width != null && message.hasOwnProperty("width"))
                    object.width = options.json && !isFinite(message.width) ? String(message.width) : message.width;
                if (message.height != null && message.hasOwnProperty("height"))
                    object.height = options.json && !isFinite(message.height) ? String(message.height) : message.height;
                return object;
            };

            /**
             * Converts this Size to JSON.
             * @function toJSON
             * @memberof synapse.workflow.Size
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Size.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Size
             * @function getTypeUrl
             * @memberof synapse.workflow.Size
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Size.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/synapse.workflow.Size";
            };

            return Size;
        })();

        workflow.Note = (function() {

            /**
             * Properties of a Note.
             * @memberof synapse.workflow
             * @interface INote
             * @property {string|null} [id] Note id
             * @property {string|null} [title] Note title
             * @property {synapse.workflow.IPosition|null} [position] Note position
             * @property {synapse.workflow.ISize|null} [size] Note size
             * @property {string|null} [content] Note content
             */

            /**
             * Constructs a new Note.
             * @memberof synapse.workflow
             * @classdesc Represents a Note.
             * @implements INote
             * @constructor
             * @param {synapse.workflow.INote=} [properties] Properties to set
             */
            function Note(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Note id.
             * @member {string} id
             * @memberof synapse.workflow.Note
             * @instance
             */
            Note.prototype.id = "";

            /**
             * Note title.
             * @member {string} title
             * @memberof synapse.workflow.Note
             * @instance
             */
            Note.prototype.title = "";

            /**
             * Note position.
             * @member {synapse.workflow.IPosition|null|undefined} position
             * @memberof synapse.workflow.Note
             * @instance
             */
            Note.prototype.position = null;

            /**
             * Note size.
             * @member {synapse.workflow.ISize|null|undefined} size
             * @memberof synapse.workflow.Note
             * @instance
             */
            Note.prototype.size = null;

            /**
             * Note content.
             * @member {string} content
             * @memberof synapse.workflow.Note
             * @instance
             */
            Note.prototype.content = "";

            /**
             * Creates a new Note instance using the specified properties.
             * @function create
             * @memberof synapse.workflow.Note
             * @static
             * @param {synapse.workflow.INote=} [properties] Properties to set
             * @returns {synapse.workflow.Note} Note instance
             */
            Note.create = function create(properties) {
                return new Note(properties);
            };

            /**
             * Encodes the specified Note message. Does not implicitly {@link synapse.workflow.Note.verify|verify} messages.
             * @function encode
             * @memberof synapse.workflow.Note
             * @static
             * @param {synapse.workflow.INote} message Note message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Note.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.title);
                if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                    $root.synapse.workflow.Position.encode(message.position, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.size != null && Object.hasOwnProperty.call(message, "size"))
                    $root.synapse.workflow.Size.encode(message.size, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.content != null && Object.hasOwnProperty.call(message, "content"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.content);
                return writer;
            };

            /**
             * Encodes the specified Note message, length delimited. Does not implicitly {@link synapse.workflow.Note.verify|verify} messages.
             * @function encodeDelimited
             * @memberof synapse.workflow.Note
             * @static
             * @param {synapse.workflow.INote} message Note message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Note.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Note message from the specified reader or buffer.
             * @function decode
             * @memberof synapse.workflow.Note
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {synapse.workflow.Note} Note
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Note.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.synapse.workflow.Note();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.string();
                            break;
                        }
                    case 2: {
                            message.title = reader.string();
                            break;
                        }
                    case 3: {
                            message.position = $root.synapse.workflow.Position.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.size = $root.synapse.workflow.Size.decode(reader, reader.uint32());
                            break;
                        }
                    case 5: {
                            message.content = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Note message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof synapse.workflow.Note
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {synapse.workflow.Note} Note
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Note.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Note message.
             * @function verify
             * @memberof synapse.workflow.Note
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Note.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.title != null && message.hasOwnProperty("title"))
                    if (!$util.isString(message.title))
                        return "title: string expected";
                if (message.position != null && message.hasOwnProperty("position")) {
                    var error = $root.synapse.workflow.Position.verify(message.position);
                    if (error)
                        return "position." + error;
                }
                if (message.size != null && message.hasOwnProperty("size")) {
                    var error = $root.synapse.workflow.Size.verify(message.size);
                    if (error)
                        return "size." + error;
                }
                if (message.content != null && message.hasOwnProperty("content"))
                    if (!$util.isString(message.content))
                        return "content: string expected";
                return null;
            };

            /**
             * Creates a Note message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof synapse.workflow.Note
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {synapse.workflow.Note} Note
             */
            Note.fromObject = function fromObject(object) {
                if (object instanceof $root.synapse.workflow.Note)
                    return object;
                var message = new $root.synapse.workflow.Note();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.title != null)
                    message.title = String(object.title);
                if (object.position != null) {
                    if (typeof object.position !== "object")
                        throw TypeError(".synapse.workflow.Note.position: object expected");
                    message.position = $root.synapse.workflow.Position.fromObject(object.position);
                }
                if (object.size != null) {
                    if (typeof object.size !== "object")
                        throw TypeError(".synapse.workflow.Note.size: object expected");
                    message.size = $root.synapse.workflow.Size.fromObject(object.size);
                }
                if (object.content != null)
                    message.content = String(object.content);
                return message;
            };

            /**
             * Creates a plain object from a Note message. Also converts values to other types if specified.
             * @function toObject
             * @memberof synapse.workflow.Note
             * @static
             * @param {synapse.workflow.Note} message Note
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Note.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.id = "";
                    object.title = "";
                    object.position = null;
                    object.size = null;
                    object.content = "";
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.title != null && message.hasOwnProperty("title"))
                    object.title = message.title;
                if (message.position != null && message.hasOwnProperty("position"))
                    object.position = $root.synapse.workflow.Position.toObject(message.position, options);
                if (message.size != null && message.hasOwnProperty("size"))
                    object.size = $root.synapse.workflow.Size.toObject(message.size, options);
                if (message.content != null && message.hasOwnProperty("content"))
                    object.content = message.content;
                return object;
            };

            /**
             * Converts this Note to JSON.
             * @function toJSON
             * @memberof synapse.workflow.Note
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Note.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Note
             * @function getTypeUrl
             * @memberof synapse.workflow.Note
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Note.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/synapse.workflow.Note";
            };

            return Note;
        })();

        workflow.ConnectionStyle = (function() {

            /**
             * Properties of a ConnectionStyle.
             * @memberof synapse.workflow
             * @interface IConnectionStyle
             * @property {string|null} [stroke] ConnectionStyle stroke
             * @property {number|null} [strokeWidth] ConnectionStyle strokeWidth
             * @property {string|null} [dashArray] ConnectionStyle dashArray
             * @property {number|null} [opacity] ConnectionStyle opacity
             * @property {number|null} [index] ConnectionStyle index
             */

            /**
             * Constructs a new ConnectionStyle.
             * @memberof synapse.workflow
             * @classdesc Represents a ConnectionStyle.
             * @implements IConnectionStyle
             * @constructor
             * @param {synapse.workflow.IConnectionStyle=} [properties] Properties to set
             */
            function ConnectionStyle(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ConnectionStyle stroke.
             * @member {string} stroke
             * @memberof synapse.workflow.ConnectionStyle
             * @instance
             */
            ConnectionStyle.prototype.stroke = "";

            /**
             * ConnectionStyle strokeWidth.
             * @member {number} strokeWidth
             * @memberof synapse.workflow.ConnectionStyle
             * @instance
             */
            ConnectionStyle.prototype.strokeWidth = 0;

            /**
             * ConnectionStyle dashArray.
             * @member {string} dashArray
             * @memberof synapse.workflow.ConnectionStyle
             * @instance
             */
            ConnectionStyle.prototype.dashArray = "";

            /**
             * ConnectionStyle opacity.
             * @member {number} opacity
             * @memberof synapse.workflow.ConnectionStyle
             * @instance
             */
            ConnectionStyle.prototype.opacity = 0;

            /**
             * ConnectionStyle index.
             * @member {number} index
             * @memberof synapse.workflow.ConnectionStyle
             * @instance
             */
            ConnectionStyle.prototype.index = 0;

            /**
             * Creates a new ConnectionStyle instance using the specified properties.
             * @function create
             * @memberof synapse.workflow.ConnectionStyle
             * @static
             * @param {synapse.workflow.IConnectionStyle=} [properties] Properties to set
             * @returns {synapse.workflow.ConnectionStyle} ConnectionStyle instance
             */
            ConnectionStyle.create = function create(properties) {
                return new ConnectionStyle(properties);
            };

            /**
             * Encodes the specified ConnectionStyle message. Does not implicitly {@link synapse.workflow.ConnectionStyle.verify|verify} messages.
             * @function encode
             * @memberof synapse.workflow.ConnectionStyle
             * @static
             * @param {synapse.workflow.IConnectionStyle} message ConnectionStyle message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ConnectionStyle.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.stroke != null && Object.hasOwnProperty.call(message, "stroke"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.stroke);
                if (message.strokeWidth != null && Object.hasOwnProperty.call(message, "strokeWidth"))
                    writer.uint32(/* id 2, wireType 5 =*/21).float(message.strokeWidth);
                if (message.dashArray != null && Object.hasOwnProperty.call(message, "dashArray"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.dashArray);
                if (message.opacity != null && Object.hasOwnProperty.call(message, "opacity"))
                    writer.uint32(/* id 4, wireType 5 =*/37).float(message.opacity);
                if (message.index != null && Object.hasOwnProperty.call(message, "index"))
                    writer.uint32(/* id 5, wireType 0 =*/40).int32(message.index);
                return writer;
            };

            /**
             * Encodes the specified ConnectionStyle message, length delimited. Does not implicitly {@link synapse.workflow.ConnectionStyle.verify|verify} messages.
             * @function encodeDelimited
             * @memberof synapse.workflow.ConnectionStyle
             * @static
             * @param {synapse.workflow.IConnectionStyle} message ConnectionStyle message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ConnectionStyle.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ConnectionStyle message from the specified reader or buffer.
             * @function decode
             * @memberof synapse.workflow.ConnectionStyle
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {synapse.workflow.ConnectionStyle} ConnectionStyle
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ConnectionStyle.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.synapse.workflow.ConnectionStyle();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.stroke = reader.string();
                            break;
                        }
                    case 2: {
                            message.strokeWidth = reader.float();
                            break;
                        }
                    case 3: {
                            message.dashArray = reader.string();
                            break;
                        }
                    case 4: {
                            message.opacity = reader.float();
                            break;
                        }
                    case 5: {
                            message.index = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ConnectionStyle message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof synapse.workflow.ConnectionStyle
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {synapse.workflow.ConnectionStyle} ConnectionStyle
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ConnectionStyle.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ConnectionStyle message.
             * @function verify
             * @memberof synapse.workflow.ConnectionStyle
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ConnectionStyle.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.stroke != null && message.hasOwnProperty("stroke"))
                    if (!$util.isString(message.stroke))
                        return "stroke: string expected";
                if (message.strokeWidth != null && message.hasOwnProperty("strokeWidth"))
                    if (typeof message.strokeWidth !== "number")
                        return "strokeWidth: number expected";
                if (message.dashArray != null && message.hasOwnProperty("dashArray"))
                    if (!$util.isString(message.dashArray))
                        return "dashArray: string expected";
                if (message.opacity != null && message.hasOwnProperty("opacity"))
                    if (typeof message.opacity !== "number")
                        return "opacity: number expected";
                if (message.index != null && message.hasOwnProperty("index"))
                    if (!$util.isInteger(message.index))
                        return "index: integer expected";
                return null;
            };

            /**
             * Creates a ConnectionStyle message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof synapse.workflow.ConnectionStyle
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {synapse.workflow.ConnectionStyle} ConnectionStyle
             */
            ConnectionStyle.fromObject = function fromObject(object) {
                if (object instanceof $root.synapse.workflow.ConnectionStyle)
                    return object;
                var message = new $root.synapse.workflow.ConnectionStyle();
                if (object.stroke != null)
                    message.stroke = String(object.stroke);
                if (object.strokeWidth != null)
                    message.strokeWidth = Number(object.strokeWidth);
                if (object.dashArray != null)
                    message.dashArray = String(object.dashArray);
                if (object.opacity != null)
                    message.opacity = Number(object.opacity);
                if (object.index != null)
                    message.index = object.index | 0;
                return message;
            };

            /**
             * Creates a plain object from a ConnectionStyle message. Also converts values to other types if specified.
             * @function toObject
             * @memberof synapse.workflow.ConnectionStyle
             * @static
             * @param {synapse.workflow.ConnectionStyle} message ConnectionStyle
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ConnectionStyle.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.stroke = "";
                    object.strokeWidth = 0;
                    object.dashArray = "";
                    object.opacity = 0;
                    object.index = 0;
                }
                if (message.stroke != null && message.hasOwnProperty("stroke"))
                    object.stroke = message.stroke;
                if (message.strokeWidth != null && message.hasOwnProperty("strokeWidth"))
                    object.strokeWidth = options.json && !isFinite(message.strokeWidth) ? String(message.strokeWidth) : message.strokeWidth;
                if (message.dashArray != null && message.hasOwnProperty("dashArray"))
                    object.dashArray = message.dashArray;
                if (message.opacity != null && message.hasOwnProperty("opacity"))
                    object.opacity = options.json && !isFinite(message.opacity) ? String(message.opacity) : message.opacity;
                if (message.index != null && message.hasOwnProperty("index"))
                    object.index = message.index;
                return object;
            };

            /**
             * Converts this ConnectionStyle to JSON.
             * @function toJSON
             * @memberof synapse.workflow.ConnectionStyle
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ConnectionStyle.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ConnectionStyle
             * @function getTypeUrl
             * @memberof synapse.workflow.ConnectionStyle
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ConnectionStyle.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/synapse.workflow.ConnectionStyle";
            };

            return ConnectionStyle;
        })();

        workflow.Connection = (function() {

            /**
             * Properties of a Connection.
             * @memberof synapse.workflow
             * @interface IConnection
             * @property {string|null} [id] Connection id
             * @property {string|null} [startElementId] Connection startElementId
             * @property {string|null} [startPortPosition] Connection startPortPosition
             * @property {string|null} [endElementId] Connection endElementId
             * @property {string|null} [endPortPosition] Connection endPortPosition
             * @property {string|null} [label] Connection label
             * @property {synapse.workflow.IConnectionStyle|null} [style] Connection style
             */

            /**
             * Constructs a new Connection.
             * @memberof synapse.workflow
             * @classdesc Represents a Connection.
             * @implements IConnection
             * @constructor
             * @param {synapse.workflow.IConnection=} [properties] Properties to set
             */
            function Connection(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Connection id.
             * @member {string} id
             * @memberof synapse.workflow.Connection
             * @instance
             */
            Connection.prototype.id = "";

            /**
             * Connection startElementId.
             * @member {string} startElementId
             * @memberof synapse.workflow.Connection
             * @instance
             */
            Connection.prototype.startElementId = "";

            /**
             * Connection startPortPosition.
             * @member {string} startPortPosition
             * @memberof synapse.workflow.Connection
             * @instance
             */
            Connection.prototype.startPortPosition = "";

            /**
             * Connection endElementId.
             * @member {string} endElementId
             * @memberof synapse.workflow.Connection
             * @instance
             */
            Connection.prototype.endElementId = "";

            /**
             * Connection endPortPosition.
             * @member {string} endPortPosition
             * @memberof synapse.workflow.Connection
             * @instance
             */
            Connection.prototype.endPortPosition = "";

            /**
             * Connection label.
             * @member {string|null|undefined} label
             * @memberof synapse.workflow.Connection
             * @instance
             */
            Connection.prototype.label = null;

            /**
             * Connection style.
             * @member {synapse.workflow.IConnectionStyle|null|undefined} style
             * @memberof synapse.workflow.Connection
             * @instance
             */
            Connection.prototype.style = null;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * Connection _label.
             * @member {"label"|undefined} _label
             * @memberof synapse.workflow.Connection
             * @instance
             */
            Object.defineProperty(Connection.prototype, "_label", {
                get: $util.oneOfGetter($oneOfFields = ["label"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Connection _style.
             * @member {"style"|undefined} _style
             * @memberof synapse.workflow.Connection
             * @instance
             */
            Object.defineProperty(Connection.prototype, "_style", {
                get: $util.oneOfGetter($oneOfFields = ["style"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new Connection instance using the specified properties.
             * @function create
             * @memberof synapse.workflow.Connection
             * @static
             * @param {synapse.workflow.IConnection=} [properties] Properties to set
             * @returns {synapse.workflow.Connection} Connection instance
             */
            Connection.create = function create(properties) {
                return new Connection(properties);
            };

            /**
             * Encodes the specified Connection message. Does not implicitly {@link synapse.workflow.Connection.verify|verify} messages.
             * @function encode
             * @memberof synapse.workflow.Connection
             * @static
             * @param {synapse.workflow.IConnection} message Connection message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Connection.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.startElementId != null && Object.hasOwnProperty.call(message, "startElementId"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.startElementId);
                if (message.startPortPosition != null && Object.hasOwnProperty.call(message, "startPortPosition"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.startPortPosition);
                if (message.endElementId != null && Object.hasOwnProperty.call(message, "endElementId"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.endElementId);
                if (message.endPortPosition != null && Object.hasOwnProperty.call(message, "endPortPosition"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.endPortPosition);
                if (message.label != null && Object.hasOwnProperty.call(message, "label"))
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.label);
                if (message.style != null && Object.hasOwnProperty.call(message, "style"))
                    $root.synapse.workflow.ConnectionStyle.encode(message.style, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Connection message, length delimited. Does not implicitly {@link synapse.workflow.Connection.verify|verify} messages.
             * @function encodeDelimited
             * @memberof synapse.workflow.Connection
             * @static
             * @param {synapse.workflow.IConnection} message Connection message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Connection.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Connection message from the specified reader or buffer.
             * @function decode
             * @memberof synapse.workflow.Connection
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {synapse.workflow.Connection} Connection
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Connection.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.synapse.workflow.Connection();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.string();
                            break;
                        }
                    case 2: {
                            message.startElementId = reader.string();
                            break;
                        }
                    case 3: {
                            message.startPortPosition = reader.string();
                            break;
                        }
                    case 4: {
                            message.endElementId = reader.string();
                            break;
                        }
                    case 5: {
                            message.endPortPosition = reader.string();
                            break;
                        }
                    case 6: {
                            message.label = reader.string();
                            break;
                        }
                    case 7: {
                            message.style = $root.synapse.workflow.ConnectionStyle.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Connection message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof synapse.workflow.Connection
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {synapse.workflow.Connection} Connection
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Connection.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Connection message.
             * @function verify
             * @memberof synapse.workflow.Connection
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Connection.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.startElementId != null && message.hasOwnProperty("startElementId"))
                    if (!$util.isString(message.startElementId))
                        return "startElementId: string expected";
                if (message.startPortPosition != null && message.hasOwnProperty("startPortPosition"))
                    if (!$util.isString(message.startPortPosition))
                        return "startPortPosition: string expected";
                if (message.endElementId != null && message.hasOwnProperty("endElementId"))
                    if (!$util.isString(message.endElementId))
                        return "endElementId: string expected";
                if (message.endPortPosition != null && message.hasOwnProperty("endPortPosition"))
                    if (!$util.isString(message.endPortPosition))
                        return "endPortPosition: string expected";
                if (message.label != null && message.hasOwnProperty("label")) {
                    properties._label = 1;
                    if (!$util.isString(message.label))
                        return "label: string expected";
                }
                if (message.style != null && message.hasOwnProperty("style")) {
                    properties._style = 1;
                    {
                        var error = $root.synapse.workflow.ConnectionStyle.verify(message.style);
                        if (error)
                            return "style." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a Connection message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof synapse.workflow.Connection
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {synapse.workflow.Connection} Connection
             */
            Connection.fromObject = function fromObject(object) {
                if (object instanceof $root.synapse.workflow.Connection)
                    return object;
                var message = new $root.synapse.workflow.Connection();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.startElementId != null)
                    message.startElementId = String(object.startElementId);
                if (object.startPortPosition != null)
                    message.startPortPosition = String(object.startPortPosition);
                if (object.endElementId != null)
                    message.endElementId = String(object.endElementId);
                if (object.endPortPosition != null)
                    message.endPortPosition = String(object.endPortPosition);
                if (object.label != null)
                    message.label = String(object.label);
                if (object.style != null) {
                    if (typeof object.style !== "object")
                        throw TypeError(".synapse.workflow.Connection.style: object expected");
                    message.style = $root.synapse.workflow.ConnectionStyle.fromObject(object.style);
                }
                return message;
            };

            /**
             * Creates a plain object from a Connection message. Also converts values to other types if specified.
             * @function toObject
             * @memberof synapse.workflow.Connection
             * @static
             * @param {synapse.workflow.Connection} message Connection
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Connection.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.id = "";
                    object.startElementId = "";
                    object.startPortPosition = "";
                    object.endElementId = "";
                    object.endPortPosition = "";
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.startElementId != null && message.hasOwnProperty("startElementId"))
                    object.startElementId = message.startElementId;
                if (message.startPortPosition != null && message.hasOwnProperty("startPortPosition"))
                    object.startPortPosition = message.startPortPosition;
                if (message.endElementId != null && message.hasOwnProperty("endElementId"))
                    object.endElementId = message.endElementId;
                if (message.endPortPosition != null && message.hasOwnProperty("endPortPosition"))
                    object.endPortPosition = message.endPortPosition;
                if (message.label != null && message.hasOwnProperty("label")) {
                    object.label = message.label;
                    if (options.oneofs)
                        object._label = "label";
                }
                if (message.style != null && message.hasOwnProperty("style")) {
                    object.style = $root.synapse.workflow.ConnectionStyle.toObject(message.style, options);
                    if (options.oneofs)
                        object._style = "style";
                }
                return object;
            };

            /**
             * Converts this Connection to JSON.
             * @function toJSON
             * @memberof synapse.workflow.Connection
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Connection.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Connection
             * @function getTypeUrl
             * @memberof synapse.workflow.Connection
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Connection.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/synapse.workflow.Connection";
            };

            return Connection;
        })();

        workflow.KanbanCard = (function() {

            /**
             * Properties of a KanbanCard.
             * @memberof synapse.workflow
             * @interface IKanbanCard
             * @property {string|null} [id] KanbanCard id
             * @property {string|null} [title] KanbanCard title
             * @property {string|null} [content] KanbanCard content
             * @property {number|null} [order] KanbanCard order
             */

            /**
             * Constructs a new KanbanCard.
             * @memberof synapse.workflow
             * @classdesc Represents a KanbanCard.
             * @implements IKanbanCard
             * @constructor
             * @param {synapse.workflow.IKanbanCard=} [properties] Properties to set
             */
            function KanbanCard(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * KanbanCard id.
             * @member {string} id
             * @memberof synapse.workflow.KanbanCard
             * @instance
             */
            KanbanCard.prototype.id = "";

            /**
             * KanbanCard title.
             * @member {string} title
             * @memberof synapse.workflow.KanbanCard
             * @instance
             */
            KanbanCard.prototype.title = "";

            /**
             * KanbanCard content.
             * @member {string|null|undefined} content
             * @memberof synapse.workflow.KanbanCard
             * @instance
             */
            KanbanCard.prototype.content = null;

            /**
             * KanbanCard order.
             * @member {number} order
             * @memberof synapse.workflow.KanbanCard
             * @instance
             */
            KanbanCard.prototype.order = 0;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * KanbanCard _content.
             * @member {"content"|undefined} _content
             * @memberof synapse.workflow.KanbanCard
             * @instance
             */
            Object.defineProperty(KanbanCard.prototype, "_content", {
                get: $util.oneOfGetter($oneOfFields = ["content"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new KanbanCard instance using the specified properties.
             * @function create
             * @memberof synapse.workflow.KanbanCard
             * @static
             * @param {synapse.workflow.IKanbanCard=} [properties] Properties to set
             * @returns {synapse.workflow.KanbanCard} KanbanCard instance
             */
            KanbanCard.create = function create(properties) {
                return new KanbanCard(properties);
            };

            /**
             * Encodes the specified KanbanCard message. Does not implicitly {@link synapse.workflow.KanbanCard.verify|verify} messages.
             * @function encode
             * @memberof synapse.workflow.KanbanCard
             * @static
             * @param {synapse.workflow.IKanbanCard} message KanbanCard message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KanbanCard.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.title);
                if (message.content != null && Object.hasOwnProperty.call(message, "content"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.content);
                if (message.order != null && Object.hasOwnProperty.call(message, "order"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int32(message.order);
                return writer;
            };

            /**
             * Encodes the specified KanbanCard message, length delimited. Does not implicitly {@link synapse.workflow.KanbanCard.verify|verify} messages.
             * @function encodeDelimited
             * @memberof synapse.workflow.KanbanCard
             * @static
             * @param {synapse.workflow.IKanbanCard} message KanbanCard message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KanbanCard.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a KanbanCard message from the specified reader or buffer.
             * @function decode
             * @memberof synapse.workflow.KanbanCard
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {synapse.workflow.KanbanCard} KanbanCard
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KanbanCard.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.synapse.workflow.KanbanCard();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.string();
                            break;
                        }
                    case 2: {
                            message.title = reader.string();
                            break;
                        }
                    case 3: {
                            message.content = reader.string();
                            break;
                        }
                    case 4: {
                            message.order = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a KanbanCard message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof synapse.workflow.KanbanCard
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {synapse.workflow.KanbanCard} KanbanCard
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KanbanCard.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a KanbanCard message.
             * @function verify
             * @memberof synapse.workflow.KanbanCard
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            KanbanCard.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.title != null && message.hasOwnProperty("title"))
                    if (!$util.isString(message.title))
                        return "title: string expected";
                if (message.content != null && message.hasOwnProperty("content")) {
                    properties._content = 1;
                    if (!$util.isString(message.content))
                        return "content: string expected";
                }
                if (message.order != null && message.hasOwnProperty("order"))
                    if (!$util.isInteger(message.order))
                        return "order: integer expected";
                return null;
            };

            /**
             * Creates a KanbanCard message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof synapse.workflow.KanbanCard
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {synapse.workflow.KanbanCard} KanbanCard
             */
            KanbanCard.fromObject = function fromObject(object) {
                if (object instanceof $root.synapse.workflow.KanbanCard)
                    return object;
                var message = new $root.synapse.workflow.KanbanCard();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.title != null)
                    message.title = String(object.title);
                if (object.content != null)
                    message.content = String(object.content);
                if (object.order != null)
                    message.order = object.order | 0;
                return message;
            };

            /**
             * Creates a plain object from a KanbanCard message. Also converts values to other types if specified.
             * @function toObject
             * @memberof synapse.workflow.KanbanCard
             * @static
             * @param {synapse.workflow.KanbanCard} message KanbanCard
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            KanbanCard.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.id = "";
                    object.title = "";
                    object.order = 0;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.title != null && message.hasOwnProperty("title"))
                    object.title = message.title;
                if (message.content != null && message.hasOwnProperty("content")) {
                    object.content = message.content;
                    if (options.oneofs)
                        object._content = "content";
                }
                if (message.order != null && message.hasOwnProperty("order"))
                    object.order = message.order;
                return object;
            };

            /**
             * Converts this KanbanCard to JSON.
             * @function toJSON
             * @memberof synapse.workflow.KanbanCard
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            KanbanCard.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for KanbanCard
             * @function getTypeUrl
             * @memberof synapse.workflow.KanbanCard
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            KanbanCard.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/synapse.workflow.KanbanCard";
            };

            return KanbanCard;
        })();

        workflow.KanbanColumn = (function() {

            /**
             * Properties of a KanbanColumn.
             * @memberof synapse.workflow
             * @interface IKanbanColumn
             * @property {string|null} [id] KanbanColumn id
             * @property {string|null} [title] KanbanColumn title
             * @property {Array.<synapse.workflow.IKanbanCard>|null} [cards] KanbanColumn cards
             * @property {number|null} [order] KanbanColumn order
             */

            /**
             * Constructs a new KanbanColumn.
             * @memberof synapse.workflow
             * @classdesc Represents a KanbanColumn.
             * @implements IKanbanColumn
             * @constructor
             * @param {synapse.workflow.IKanbanColumn=} [properties] Properties to set
             */
            function KanbanColumn(properties) {
                this.cards = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * KanbanColumn id.
             * @member {string} id
             * @memberof synapse.workflow.KanbanColumn
             * @instance
             */
            KanbanColumn.prototype.id = "";

            /**
             * KanbanColumn title.
             * @member {string} title
             * @memberof synapse.workflow.KanbanColumn
             * @instance
             */
            KanbanColumn.prototype.title = "";

            /**
             * KanbanColumn cards.
             * @member {Array.<synapse.workflow.IKanbanCard>} cards
             * @memberof synapse.workflow.KanbanColumn
             * @instance
             */
            KanbanColumn.prototype.cards = $util.emptyArray;

            /**
             * KanbanColumn order.
             * @member {number} order
             * @memberof synapse.workflow.KanbanColumn
             * @instance
             */
            KanbanColumn.prototype.order = 0;

            /**
             * Creates a new KanbanColumn instance using the specified properties.
             * @function create
             * @memberof synapse.workflow.KanbanColumn
             * @static
             * @param {synapse.workflow.IKanbanColumn=} [properties] Properties to set
             * @returns {synapse.workflow.KanbanColumn} KanbanColumn instance
             */
            KanbanColumn.create = function create(properties) {
                return new KanbanColumn(properties);
            };

            /**
             * Encodes the specified KanbanColumn message. Does not implicitly {@link synapse.workflow.KanbanColumn.verify|verify} messages.
             * @function encode
             * @memberof synapse.workflow.KanbanColumn
             * @static
             * @param {synapse.workflow.IKanbanColumn} message KanbanColumn message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KanbanColumn.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.title);
                if (message.cards != null && message.cards.length)
                    for (var i = 0; i < message.cards.length; ++i)
                        $root.synapse.workflow.KanbanCard.encode(message.cards[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.order != null && Object.hasOwnProperty.call(message, "order"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int32(message.order);
                return writer;
            };

            /**
             * Encodes the specified KanbanColumn message, length delimited. Does not implicitly {@link synapse.workflow.KanbanColumn.verify|verify} messages.
             * @function encodeDelimited
             * @memberof synapse.workflow.KanbanColumn
             * @static
             * @param {synapse.workflow.IKanbanColumn} message KanbanColumn message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KanbanColumn.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a KanbanColumn message from the specified reader or buffer.
             * @function decode
             * @memberof synapse.workflow.KanbanColumn
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {synapse.workflow.KanbanColumn} KanbanColumn
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KanbanColumn.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.synapse.workflow.KanbanColumn();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.string();
                            break;
                        }
                    case 2: {
                            message.title = reader.string();
                            break;
                        }
                    case 3: {
                            if (!(message.cards && message.cards.length))
                                message.cards = [];
                            message.cards.push($root.synapse.workflow.KanbanCard.decode(reader, reader.uint32()));
                            break;
                        }
                    case 4: {
                            message.order = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a KanbanColumn message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof synapse.workflow.KanbanColumn
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {synapse.workflow.KanbanColumn} KanbanColumn
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KanbanColumn.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a KanbanColumn message.
             * @function verify
             * @memberof synapse.workflow.KanbanColumn
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            KanbanColumn.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.title != null && message.hasOwnProperty("title"))
                    if (!$util.isString(message.title))
                        return "title: string expected";
                if (message.cards != null && message.hasOwnProperty("cards")) {
                    if (!Array.isArray(message.cards))
                        return "cards: array expected";
                    for (var i = 0; i < message.cards.length; ++i) {
                        var error = $root.synapse.workflow.KanbanCard.verify(message.cards[i]);
                        if (error)
                            return "cards." + error;
                    }
                }
                if (message.order != null && message.hasOwnProperty("order"))
                    if (!$util.isInteger(message.order))
                        return "order: integer expected";
                return null;
            };

            /**
             * Creates a KanbanColumn message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof synapse.workflow.KanbanColumn
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {synapse.workflow.KanbanColumn} KanbanColumn
             */
            KanbanColumn.fromObject = function fromObject(object) {
                if (object instanceof $root.synapse.workflow.KanbanColumn)
                    return object;
                var message = new $root.synapse.workflow.KanbanColumn();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.title != null)
                    message.title = String(object.title);
                if (object.cards) {
                    if (!Array.isArray(object.cards))
                        throw TypeError(".synapse.workflow.KanbanColumn.cards: array expected");
                    message.cards = [];
                    for (var i = 0; i < object.cards.length; ++i) {
                        if (typeof object.cards[i] !== "object")
                            throw TypeError(".synapse.workflow.KanbanColumn.cards: object expected");
                        message.cards[i] = $root.synapse.workflow.KanbanCard.fromObject(object.cards[i]);
                    }
                }
                if (object.order != null)
                    message.order = object.order | 0;
                return message;
            };

            /**
             * Creates a plain object from a KanbanColumn message. Also converts values to other types if specified.
             * @function toObject
             * @memberof synapse.workflow.KanbanColumn
             * @static
             * @param {synapse.workflow.KanbanColumn} message KanbanColumn
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            KanbanColumn.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.cards = [];
                if (options.defaults) {
                    object.id = "";
                    object.title = "";
                    object.order = 0;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.title != null && message.hasOwnProperty("title"))
                    object.title = message.title;
                if (message.cards && message.cards.length) {
                    object.cards = [];
                    for (var j = 0; j < message.cards.length; ++j)
                        object.cards[j] = $root.synapse.workflow.KanbanCard.toObject(message.cards[j], options);
                }
                if (message.order != null && message.hasOwnProperty("order"))
                    object.order = message.order;
                return object;
            };

            /**
             * Converts this KanbanColumn to JSON.
             * @function toJSON
             * @memberof synapse.workflow.KanbanColumn
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            KanbanColumn.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for KanbanColumn
             * @function getTypeUrl
             * @memberof synapse.workflow.KanbanColumn
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            KanbanColumn.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/synapse.workflow.KanbanColumn";
            };

            return KanbanColumn;
        })();

        workflow.KanbanBoard = (function() {

            /**
             * Properties of a KanbanBoard.
             * @memberof synapse.workflow
             * @interface IKanbanBoard
             * @property {string|null} [id] KanbanBoard id
             * @property {string|null} [title] KanbanBoard title
             * @property {Array.<synapse.workflow.IKanbanColumn>|null} [columns] KanbanBoard columns
             * @property {synapse.workflow.IPosition|null} [position] KanbanBoard position
             * @property {synapse.workflow.ISize|null} [size] KanbanBoard size
             */

            /**
             * Constructs a new KanbanBoard.
             * @memberof synapse.workflow
             * @classdesc Represents a KanbanBoard.
             * @implements IKanbanBoard
             * @constructor
             * @param {synapse.workflow.IKanbanBoard=} [properties] Properties to set
             */
            function KanbanBoard(properties) {
                this.columns = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * KanbanBoard id.
             * @member {string} id
             * @memberof synapse.workflow.KanbanBoard
             * @instance
             */
            KanbanBoard.prototype.id = "";

            /**
             * KanbanBoard title.
             * @member {string} title
             * @memberof synapse.workflow.KanbanBoard
             * @instance
             */
            KanbanBoard.prototype.title = "";

            /**
             * KanbanBoard columns.
             * @member {Array.<synapse.workflow.IKanbanColumn>} columns
             * @memberof synapse.workflow.KanbanBoard
             * @instance
             */
            KanbanBoard.prototype.columns = $util.emptyArray;

            /**
             * KanbanBoard position.
             * @member {synapse.workflow.IPosition|null|undefined} position
             * @memberof synapse.workflow.KanbanBoard
             * @instance
             */
            KanbanBoard.prototype.position = null;

            /**
             * KanbanBoard size.
             * @member {synapse.workflow.ISize|null|undefined} size
             * @memberof synapse.workflow.KanbanBoard
             * @instance
             */
            KanbanBoard.prototype.size = null;

            /**
             * Creates a new KanbanBoard instance using the specified properties.
             * @function create
             * @memberof synapse.workflow.KanbanBoard
             * @static
             * @param {synapse.workflow.IKanbanBoard=} [properties] Properties to set
             * @returns {synapse.workflow.KanbanBoard} KanbanBoard instance
             */
            KanbanBoard.create = function create(properties) {
                return new KanbanBoard(properties);
            };

            /**
             * Encodes the specified KanbanBoard message. Does not implicitly {@link synapse.workflow.KanbanBoard.verify|verify} messages.
             * @function encode
             * @memberof synapse.workflow.KanbanBoard
             * @static
             * @param {synapse.workflow.IKanbanBoard} message KanbanBoard message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KanbanBoard.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.title);
                if (message.columns != null && message.columns.length)
                    for (var i = 0; i < message.columns.length; ++i)
                        $root.synapse.workflow.KanbanColumn.encode(message.columns[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                    $root.synapse.workflow.Position.encode(message.position, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.size != null && Object.hasOwnProperty.call(message, "size"))
                    $root.synapse.workflow.Size.encode(message.size, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified KanbanBoard message, length delimited. Does not implicitly {@link synapse.workflow.KanbanBoard.verify|verify} messages.
             * @function encodeDelimited
             * @memberof synapse.workflow.KanbanBoard
             * @static
             * @param {synapse.workflow.IKanbanBoard} message KanbanBoard message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KanbanBoard.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a KanbanBoard message from the specified reader or buffer.
             * @function decode
             * @memberof synapse.workflow.KanbanBoard
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {synapse.workflow.KanbanBoard} KanbanBoard
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KanbanBoard.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.synapse.workflow.KanbanBoard();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.string();
                            break;
                        }
                    case 2: {
                            message.title = reader.string();
                            break;
                        }
                    case 3: {
                            if (!(message.columns && message.columns.length))
                                message.columns = [];
                            message.columns.push($root.synapse.workflow.KanbanColumn.decode(reader, reader.uint32()));
                            break;
                        }
                    case 4: {
                            message.position = $root.synapse.workflow.Position.decode(reader, reader.uint32());
                            break;
                        }
                    case 5: {
                            message.size = $root.synapse.workflow.Size.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a KanbanBoard message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof synapse.workflow.KanbanBoard
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {synapse.workflow.KanbanBoard} KanbanBoard
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KanbanBoard.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a KanbanBoard message.
             * @function verify
             * @memberof synapse.workflow.KanbanBoard
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            KanbanBoard.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.title != null && message.hasOwnProperty("title"))
                    if (!$util.isString(message.title))
                        return "title: string expected";
                if (message.columns != null && message.hasOwnProperty("columns")) {
                    if (!Array.isArray(message.columns))
                        return "columns: array expected";
                    for (var i = 0; i < message.columns.length; ++i) {
                        var error = $root.synapse.workflow.KanbanColumn.verify(message.columns[i]);
                        if (error)
                            return "columns." + error;
                    }
                }
                if (message.position != null && message.hasOwnProperty("position")) {
                    var error = $root.synapse.workflow.Position.verify(message.position);
                    if (error)
                        return "position." + error;
                }
                if (message.size != null && message.hasOwnProperty("size")) {
                    var error = $root.synapse.workflow.Size.verify(message.size);
                    if (error)
                        return "size." + error;
                }
                return null;
            };

            /**
             * Creates a KanbanBoard message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof synapse.workflow.KanbanBoard
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {synapse.workflow.KanbanBoard} KanbanBoard
             */
            KanbanBoard.fromObject = function fromObject(object) {
                if (object instanceof $root.synapse.workflow.KanbanBoard)
                    return object;
                var message = new $root.synapse.workflow.KanbanBoard();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.title != null)
                    message.title = String(object.title);
                if (object.columns) {
                    if (!Array.isArray(object.columns))
                        throw TypeError(".synapse.workflow.KanbanBoard.columns: array expected");
                    message.columns = [];
                    for (var i = 0; i < object.columns.length; ++i) {
                        if (typeof object.columns[i] !== "object")
                            throw TypeError(".synapse.workflow.KanbanBoard.columns: object expected");
                        message.columns[i] = $root.synapse.workflow.KanbanColumn.fromObject(object.columns[i]);
                    }
                }
                if (object.position != null) {
                    if (typeof object.position !== "object")
                        throw TypeError(".synapse.workflow.KanbanBoard.position: object expected");
                    message.position = $root.synapse.workflow.Position.fromObject(object.position);
                }
                if (object.size != null) {
                    if (typeof object.size !== "object")
                        throw TypeError(".synapse.workflow.KanbanBoard.size: object expected");
                    message.size = $root.synapse.workflow.Size.fromObject(object.size);
                }
                return message;
            };

            /**
             * Creates a plain object from a KanbanBoard message. Also converts values to other types if specified.
             * @function toObject
             * @memberof synapse.workflow.KanbanBoard
             * @static
             * @param {synapse.workflow.KanbanBoard} message KanbanBoard
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            KanbanBoard.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.columns = [];
                if (options.defaults) {
                    object.id = "";
                    object.title = "";
                    object.position = null;
                    object.size = null;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.title != null && message.hasOwnProperty("title"))
                    object.title = message.title;
                if (message.columns && message.columns.length) {
                    object.columns = [];
                    for (var j = 0; j < message.columns.length; ++j)
                        object.columns[j] = $root.synapse.workflow.KanbanColumn.toObject(message.columns[j], options);
                }
                if (message.position != null && message.hasOwnProperty("position"))
                    object.position = $root.synapse.workflow.Position.toObject(message.position, options);
                if (message.size != null && message.hasOwnProperty("size"))
                    object.size = $root.synapse.workflow.Size.toObject(message.size, options);
                return object;
            };

            /**
             * Converts this KanbanBoard to JSON.
             * @function toJSON
             * @memberof synapse.workflow.KanbanBoard
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            KanbanBoard.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for KanbanBoard
             * @function getTypeUrl
             * @memberof synapse.workflow.KanbanBoard
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            KanbanBoard.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/synapse.workflow.KanbanBoard";
            };

            return KanbanBoard;
        })();

        workflow.NodePort = (function() {

            /**
             * Properties of a NodePort.
             * @memberof synapse.workflow
             * @interface INodePort
             * @property {string|null} [id] NodePort id
             * @property {string|null} [name] NodePort name
             * @property {string|null} [type] NodePort type
             * @property {boolean|null} [isInput] NodePort isInput
             * @property {string|null} [defaultValue] NodePort defaultValue
             */

            /**
             * Constructs a new NodePort.
             * @memberof synapse.workflow
             * @classdesc Represents a NodePort.
             * @implements INodePort
             * @constructor
             * @param {synapse.workflow.INodePort=} [properties] Properties to set
             */
            function NodePort(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * NodePort id.
             * @member {string} id
             * @memberof synapse.workflow.NodePort
             * @instance
             */
            NodePort.prototype.id = "";

            /**
             * NodePort name.
             * @member {string} name
             * @memberof synapse.workflow.NodePort
             * @instance
             */
            NodePort.prototype.name = "";

            /**
             * NodePort type.
             * @member {string} type
             * @memberof synapse.workflow.NodePort
             * @instance
             */
            NodePort.prototype.type = "";

            /**
             * NodePort isInput.
             * @member {boolean} isInput
             * @memberof synapse.workflow.NodePort
             * @instance
             */
            NodePort.prototype.isInput = false;

            /**
             * NodePort defaultValue.
             * @member {string|null|undefined} defaultValue
             * @memberof synapse.workflow.NodePort
             * @instance
             */
            NodePort.prototype.defaultValue = null;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * NodePort _defaultValue.
             * @member {"defaultValue"|undefined} _defaultValue
             * @memberof synapse.workflow.NodePort
             * @instance
             */
            Object.defineProperty(NodePort.prototype, "_defaultValue", {
                get: $util.oneOfGetter($oneOfFields = ["defaultValue"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new NodePort instance using the specified properties.
             * @function create
             * @memberof synapse.workflow.NodePort
             * @static
             * @param {synapse.workflow.INodePort=} [properties] Properties to set
             * @returns {synapse.workflow.NodePort} NodePort instance
             */
            NodePort.create = function create(properties) {
                return new NodePort(properties);
            };

            /**
             * Encodes the specified NodePort message. Does not implicitly {@link synapse.workflow.NodePort.verify|verify} messages.
             * @function encode
             * @memberof synapse.workflow.NodePort
             * @static
             * @param {synapse.workflow.INodePort} message NodePort message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            NodePort.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.type);
                if (message.isInput != null && Object.hasOwnProperty.call(message, "isInput"))
                    writer.uint32(/* id 4, wireType 0 =*/32).bool(message.isInput);
                if (message.defaultValue != null && Object.hasOwnProperty.call(message, "defaultValue"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.defaultValue);
                return writer;
            };

            /**
             * Encodes the specified NodePort message, length delimited. Does not implicitly {@link synapse.workflow.NodePort.verify|verify} messages.
             * @function encodeDelimited
             * @memberof synapse.workflow.NodePort
             * @static
             * @param {synapse.workflow.INodePort} message NodePort message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            NodePort.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a NodePort message from the specified reader or buffer.
             * @function decode
             * @memberof synapse.workflow.NodePort
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {synapse.workflow.NodePort} NodePort
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            NodePort.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.synapse.workflow.NodePort();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.string();
                            break;
                        }
                    case 2: {
                            message.name = reader.string();
                            break;
                        }
                    case 3: {
                            message.type = reader.string();
                            break;
                        }
                    case 4: {
                            message.isInput = reader.bool();
                            break;
                        }
                    case 5: {
                            message.defaultValue = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a NodePort message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof synapse.workflow.NodePort
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {synapse.workflow.NodePort} NodePort
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            NodePort.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a NodePort message.
             * @function verify
             * @memberof synapse.workflow.NodePort
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            NodePort.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    if (!$util.isString(message.type))
                        return "type: string expected";
                if (message.isInput != null && message.hasOwnProperty("isInput"))
                    if (typeof message.isInput !== "boolean")
                        return "isInput: boolean expected";
                if (message.defaultValue != null && message.hasOwnProperty("defaultValue")) {
                    properties._defaultValue = 1;
                    if (!$util.isString(message.defaultValue))
                        return "defaultValue: string expected";
                }
                return null;
            };

            /**
             * Creates a NodePort message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof synapse.workflow.NodePort
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {synapse.workflow.NodePort} NodePort
             */
            NodePort.fromObject = function fromObject(object) {
                if (object instanceof $root.synapse.workflow.NodePort)
                    return object;
                var message = new $root.synapse.workflow.NodePort();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.name != null)
                    message.name = String(object.name);
                if (object.type != null)
                    message.type = String(object.type);
                if (object.isInput != null)
                    message.isInput = Boolean(object.isInput);
                if (object.defaultValue != null)
                    message.defaultValue = String(object.defaultValue);
                return message;
            };

            /**
             * Creates a plain object from a NodePort message. Also converts values to other types if specified.
             * @function toObject
             * @memberof synapse.workflow.NodePort
             * @static
             * @param {synapse.workflow.NodePort} message NodePort
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            NodePort.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.id = "";
                    object.name = "";
                    object.type = "";
                    object.isInput = false;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = message.type;
                if (message.isInput != null && message.hasOwnProperty("isInput"))
                    object.isInput = message.isInput;
                if (message.defaultValue != null && message.hasOwnProperty("defaultValue")) {
                    object.defaultValue = message.defaultValue;
                    if (options.oneofs)
                        object._defaultValue = "defaultValue";
                }
                return object;
            };

            /**
             * Converts this NodePort to JSON.
             * @function toJSON
             * @memberof synapse.workflow.NodePort
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            NodePort.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for NodePort
             * @function getTypeUrl
             * @memberof synapse.workflow.NodePort
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            NodePort.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/synapse.workflow.NodePort";
            };

            return NodePort;
        })();

        workflow.NodeProperty = (function() {

            /**
             * Properties of a NodeProperty.
             * @memberof synapse.workflow
             * @interface INodeProperty
             * @property {string|null} [id] NodeProperty id
             * @property {string|null} [name] NodeProperty name
             * @property {string|null} [type] NodeProperty type
             * @property {string|null} [value] NodeProperty value
             * @property {string|null} [description] NodeProperty description
             */

            /**
             * Constructs a new NodeProperty.
             * @memberof synapse.workflow
             * @classdesc Represents a NodeProperty.
             * @implements INodeProperty
             * @constructor
             * @param {synapse.workflow.INodeProperty=} [properties] Properties to set
             */
            function NodeProperty(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * NodeProperty id.
             * @member {string} id
             * @memberof synapse.workflow.NodeProperty
             * @instance
             */
            NodeProperty.prototype.id = "";

            /**
             * NodeProperty name.
             * @member {string} name
             * @memberof synapse.workflow.NodeProperty
             * @instance
             */
            NodeProperty.prototype.name = "";

            /**
             * NodeProperty type.
             * @member {string} type
             * @memberof synapse.workflow.NodeProperty
             * @instance
             */
            NodeProperty.prototype.type = "";

            /**
             * NodeProperty value.
             * @member {string} value
             * @memberof synapse.workflow.NodeProperty
             * @instance
             */
            NodeProperty.prototype.value = "";

            /**
             * NodeProperty description.
             * @member {string|null|undefined} description
             * @memberof synapse.workflow.NodeProperty
             * @instance
             */
            NodeProperty.prototype.description = null;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * NodeProperty _description.
             * @member {"description"|undefined} _description
             * @memberof synapse.workflow.NodeProperty
             * @instance
             */
            Object.defineProperty(NodeProperty.prototype, "_description", {
                get: $util.oneOfGetter($oneOfFields = ["description"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new NodeProperty instance using the specified properties.
             * @function create
             * @memberof synapse.workflow.NodeProperty
             * @static
             * @param {synapse.workflow.INodeProperty=} [properties] Properties to set
             * @returns {synapse.workflow.NodeProperty} NodeProperty instance
             */
            NodeProperty.create = function create(properties) {
                return new NodeProperty(properties);
            };

            /**
             * Encodes the specified NodeProperty message. Does not implicitly {@link synapse.workflow.NodeProperty.verify|verify} messages.
             * @function encode
             * @memberof synapse.workflow.NodeProperty
             * @static
             * @param {synapse.workflow.INodeProperty} message NodeProperty message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            NodeProperty.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.type);
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.value);
                if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.description);
                return writer;
            };

            /**
             * Encodes the specified NodeProperty message, length delimited. Does not implicitly {@link synapse.workflow.NodeProperty.verify|verify} messages.
             * @function encodeDelimited
             * @memberof synapse.workflow.NodeProperty
             * @static
             * @param {synapse.workflow.INodeProperty} message NodeProperty message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            NodeProperty.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a NodeProperty message from the specified reader or buffer.
             * @function decode
             * @memberof synapse.workflow.NodeProperty
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {synapse.workflow.NodeProperty} NodeProperty
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            NodeProperty.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.synapse.workflow.NodeProperty();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.string();
                            break;
                        }
                    case 2: {
                            message.name = reader.string();
                            break;
                        }
                    case 3: {
                            message.type = reader.string();
                            break;
                        }
                    case 4: {
                            message.value = reader.string();
                            break;
                        }
                    case 5: {
                            message.description = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a NodeProperty message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof synapse.workflow.NodeProperty
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {synapse.workflow.NodeProperty} NodeProperty
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            NodeProperty.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a NodeProperty message.
             * @function verify
             * @memberof synapse.workflow.NodeProperty
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            NodeProperty.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    if (!$util.isString(message.type))
                        return "type: string expected";
                if (message.value != null && message.hasOwnProperty("value"))
                    if (!$util.isString(message.value))
                        return "value: string expected";
                if (message.description != null && message.hasOwnProperty("description")) {
                    properties._description = 1;
                    if (!$util.isString(message.description))
                        return "description: string expected";
                }
                return null;
            };

            /**
             * Creates a NodeProperty message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof synapse.workflow.NodeProperty
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {synapse.workflow.NodeProperty} NodeProperty
             */
            NodeProperty.fromObject = function fromObject(object) {
                if (object instanceof $root.synapse.workflow.NodeProperty)
                    return object;
                var message = new $root.synapse.workflow.NodeProperty();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.name != null)
                    message.name = String(object.name);
                if (object.type != null)
                    message.type = String(object.type);
                if (object.value != null)
                    message.value = String(object.value);
                if (object.description != null)
                    message.description = String(object.description);
                return message;
            };

            /**
             * Creates a plain object from a NodeProperty message. Also converts values to other types if specified.
             * @function toObject
             * @memberof synapse.workflow.NodeProperty
             * @static
             * @param {synapse.workflow.NodeProperty} message NodeProperty
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            NodeProperty.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.id = "";
                    object.name = "";
                    object.type = "";
                    object.value = "";
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = message.type;
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = message.value;
                if (message.description != null && message.hasOwnProperty("description")) {
                    object.description = message.description;
                    if (options.oneofs)
                        object._description = "description";
                }
                return object;
            };

            /**
             * Converts this NodeProperty to JSON.
             * @function toJSON
             * @memberof synapse.workflow.NodeProperty
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            NodeProperty.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for NodeProperty
             * @function getTypeUrl
             * @memberof synapse.workflow.NodeProperty
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            NodeProperty.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/synapse.workflow.NodeProperty";
            };

            return NodeProperty;
        })();

        workflow.AINode = (function() {

            /**
             * Properties of a AINode.
             * @memberof synapse.workflow
             * @interface IAINode
             * @property {string|null} [id] AINode id
             * @property {string|null} [type] AINode type
             * @property {string|null} [name] AINode name
             * @property {synapse.workflow.IPosition|null} [position] AINode position
             * @property {string|null} [description] AINode description
             * @property {Array.<synapse.workflow.INodePort>|null} [ports] AINode ports
             * @property {Array.<synapse.workflow.INodeProperty>|null} [properties] AINode properties
             * @property {string|null} [category] AINode category
             * @property {string|null} [icon] AINode icon
             * @property {string|null} [state] AINode state
             * @property {string|null} [errorMessage] AINode errorMessage
             */

            /**
             * Constructs a new AINode.
             * @memberof synapse.workflow
             * @classdesc Represents a AINode.
             * @implements IAINode
             * @constructor
             * @param {synapse.workflow.IAINode=} [properties] Properties to set
             */
            function AINode(properties) {
                this.ports = [];
                this.properties = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * AINode id.
             * @member {string} id
             * @memberof synapse.workflow.AINode
             * @instance
             */
            AINode.prototype.id = "";

            /**
             * AINode type.
             * @member {string} type
             * @memberof synapse.workflow.AINode
             * @instance
             */
            AINode.prototype.type = "";

            /**
             * AINode name.
             * @member {string} name
             * @memberof synapse.workflow.AINode
             * @instance
             */
            AINode.prototype.name = "";

            /**
             * AINode position.
             * @member {synapse.workflow.IPosition|null|undefined} position
             * @memberof synapse.workflow.AINode
             * @instance
             */
            AINode.prototype.position = null;

            /**
             * AINode description.
             * @member {string|null|undefined} description
             * @memberof synapse.workflow.AINode
             * @instance
             */
            AINode.prototype.description = null;

            /**
             * AINode ports.
             * @member {Array.<synapse.workflow.INodePort>} ports
             * @memberof synapse.workflow.AINode
             * @instance
             */
            AINode.prototype.ports = $util.emptyArray;

            /**
             * AINode properties.
             * @member {Array.<synapse.workflow.INodeProperty>} properties
             * @memberof synapse.workflow.AINode
             * @instance
             */
            AINode.prototype.properties = $util.emptyArray;

            /**
             * AINode category.
             * @member {string|null|undefined} category
             * @memberof synapse.workflow.AINode
             * @instance
             */
            AINode.prototype.category = null;

            /**
             * AINode icon.
             * @member {string|null|undefined} icon
             * @memberof synapse.workflow.AINode
             * @instance
             */
            AINode.prototype.icon = null;

            /**
             * AINode state.
             * @member {string} state
             * @memberof synapse.workflow.AINode
             * @instance
             */
            AINode.prototype.state = "";

            /**
             * AINode errorMessage.
             * @member {string|null|undefined} errorMessage
             * @memberof synapse.workflow.AINode
             * @instance
             */
            AINode.prototype.errorMessage = null;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * AINode _description.
             * @member {"description"|undefined} _description
             * @memberof synapse.workflow.AINode
             * @instance
             */
            Object.defineProperty(AINode.prototype, "_description", {
                get: $util.oneOfGetter($oneOfFields = ["description"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * AINode _category.
             * @member {"category"|undefined} _category
             * @memberof synapse.workflow.AINode
             * @instance
             */
            Object.defineProperty(AINode.prototype, "_category", {
                get: $util.oneOfGetter($oneOfFields = ["category"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * AINode _icon.
             * @member {"icon"|undefined} _icon
             * @memberof synapse.workflow.AINode
             * @instance
             */
            Object.defineProperty(AINode.prototype, "_icon", {
                get: $util.oneOfGetter($oneOfFields = ["icon"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * AINode _errorMessage.
             * @member {"errorMessage"|undefined} _errorMessage
             * @memberof synapse.workflow.AINode
             * @instance
             */
            Object.defineProperty(AINode.prototype, "_errorMessage", {
                get: $util.oneOfGetter($oneOfFields = ["errorMessage"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new AINode instance using the specified properties.
             * @function create
             * @memberof synapse.workflow.AINode
             * @static
             * @param {synapse.workflow.IAINode=} [properties] Properties to set
             * @returns {synapse.workflow.AINode} AINode instance
             */
            AINode.create = function create(properties) {
                return new AINode(properties);
            };

            /**
             * Encodes the specified AINode message. Does not implicitly {@link synapse.workflow.AINode.verify|verify} messages.
             * @function encode
             * @memberof synapse.workflow.AINode
             * @static
             * @param {synapse.workflow.IAINode} message AINode message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AINode.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.type);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.name);
                if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                    $root.synapse.workflow.Position.encode(message.position, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.description);
                if (message.ports != null && message.ports.length)
                    for (var i = 0; i < message.ports.length; ++i)
                        $root.synapse.workflow.NodePort.encode(message.ports[i], writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                if (message.properties != null && message.properties.length)
                    for (var i = 0; i < message.properties.length; ++i)
                        $root.synapse.workflow.NodeProperty.encode(message.properties[i], writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                if (message.category != null && Object.hasOwnProperty.call(message, "category"))
                    writer.uint32(/* id 8, wireType 2 =*/66).string(message.category);
                if (message.icon != null && Object.hasOwnProperty.call(message, "icon"))
                    writer.uint32(/* id 9, wireType 2 =*/74).string(message.icon);
                if (message.state != null && Object.hasOwnProperty.call(message, "state"))
                    writer.uint32(/* id 10, wireType 2 =*/82).string(message.state);
                if (message.errorMessage != null && Object.hasOwnProperty.call(message, "errorMessage"))
                    writer.uint32(/* id 11, wireType 2 =*/90).string(message.errorMessage);
                return writer;
            };

            /**
             * Encodes the specified AINode message, length delimited. Does not implicitly {@link synapse.workflow.AINode.verify|verify} messages.
             * @function encodeDelimited
             * @memberof synapse.workflow.AINode
             * @static
             * @param {synapse.workflow.IAINode} message AINode message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AINode.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a AINode message from the specified reader or buffer.
             * @function decode
             * @memberof synapse.workflow.AINode
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {synapse.workflow.AINode} AINode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AINode.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.synapse.workflow.AINode();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.string();
                            break;
                        }
                    case 2: {
                            message.type = reader.string();
                            break;
                        }
                    case 3: {
                            message.name = reader.string();
                            break;
                        }
                    case 4: {
                            message.position = $root.synapse.workflow.Position.decode(reader, reader.uint32());
                            break;
                        }
                    case 5: {
                            message.description = reader.string();
                            break;
                        }
                    case 6: {
                            if (!(message.ports && message.ports.length))
                                message.ports = [];
                            message.ports.push($root.synapse.workflow.NodePort.decode(reader, reader.uint32()));
                            break;
                        }
                    case 7: {
                            if (!(message.properties && message.properties.length))
                                message.properties = [];
                            message.properties.push($root.synapse.workflow.NodeProperty.decode(reader, reader.uint32()));
                            break;
                        }
                    case 8: {
                            message.category = reader.string();
                            break;
                        }
                    case 9: {
                            message.icon = reader.string();
                            break;
                        }
                    case 10: {
                            message.state = reader.string();
                            break;
                        }
                    case 11: {
                            message.errorMessage = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a AINode message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof synapse.workflow.AINode
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {synapse.workflow.AINode} AINode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AINode.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a AINode message.
             * @function verify
             * @memberof synapse.workflow.AINode
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            AINode.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    if (!$util.isString(message.type))
                        return "type: string expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.position != null && message.hasOwnProperty("position")) {
                    var error = $root.synapse.workflow.Position.verify(message.position);
                    if (error)
                        return "position." + error;
                }
                if (message.description != null && message.hasOwnProperty("description")) {
                    properties._description = 1;
                    if (!$util.isString(message.description))
                        return "description: string expected";
                }
                if (message.ports != null && message.hasOwnProperty("ports")) {
                    if (!Array.isArray(message.ports))
                        return "ports: array expected";
                    for (var i = 0; i < message.ports.length; ++i) {
                        var error = $root.synapse.workflow.NodePort.verify(message.ports[i]);
                        if (error)
                            return "ports." + error;
                    }
                }
                if (message.properties != null && message.hasOwnProperty("properties")) {
                    if (!Array.isArray(message.properties))
                        return "properties: array expected";
                    for (var i = 0; i < message.properties.length; ++i) {
                        var error = $root.synapse.workflow.NodeProperty.verify(message.properties[i]);
                        if (error)
                            return "properties." + error;
                    }
                }
                if (message.category != null && message.hasOwnProperty("category")) {
                    properties._category = 1;
                    if (!$util.isString(message.category))
                        return "category: string expected";
                }
                if (message.icon != null && message.hasOwnProperty("icon")) {
                    properties._icon = 1;
                    if (!$util.isString(message.icon))
                        return "icon: string expected";
                }
                if (message.state != null && message.hasOwnProperty("state"))
                    if (!$util.isString(message.state))
                        return "state: string expected";
                if (message.errorMessage != null && message.hasOwnProperty("errorMessage")) {
                    properties._errorMessage = 1;
                    if (!$util.isString(message.errorMessage))
                        return "errorMessage: string expected";
                }
                return null;
            };

            /**
             * Creates a AINode message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof synapse.workflow.AINode
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {synapse.workflow.AINode} AINode
             */
            AINode.fromObject = function fromObject(object) {
                if (object instanceof $root.synapse.workflow.AINode)
                    return object;
                var message = new $root.synapse.workflow.AINode();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.type != null)
                    message.type = String(object.type);
                if (object.name != null)
                    message.name = String(object.name);
                if (object.position != null) {
                    if (typeof object.position !== "object")
                        throw TypeError(".synapse.workflow.AINode.position: object expected");
                    message.position = $root.synapse.workflow.Position.fromObject(object.position);
                }
                if (object.description != null)
                    message.description = String(object.description);
                if (object.ports) {
                    if (!Array.isArray(object.ports))
                        throw TypeError(".synapse.workflow.AINode.ports: array expected");
                    message.ports = [];
                    for (var i = 0; i < object.ports.length; ++i) {
                        if (typeof object.ports[i] !== "object")
                            throw TypeError(".synapse.workflow.AINode.ports: object expected");
                        message.ports[i] = $root.synapse.workflow.NodePort.fromObject(object.ports[i]);
                    }
                }
                if (object.properties) {
                    if (!Array.isArray(object.properties))
                        throw TypeError(".synapse.workflow.AINode.properties: array expected");
                    message.properties = [];
                    for (var i = 0; i < object.properties.length; ++i) {
                        if (typeof object.properties[i] !== "object")
                            throw TypeError(".synapse.workflow.AINode.properties: object expected");
                        message.properties[i] = $root.synapse.workflow.NodeProperty.fromObject(object.properties[i]);
                    }
                }
                if (object.category != null)
                    message.category = String(object.category);
                if (object.icon != null)
                    message.icon = String(object.icon);
                if (object.state != null)
                    message.state = String(object.state);
                if (object.errorMessage != null)
                    message.errorMessage = String(object.errorMessage);
                return message;
            };

            /**
             * Creates a plain object from a AINode message. Also converts values to other types if specified.
             * @function toObject
             * @memberof synapse.workflow.AINode
             * @static
             * @param {synapse.workflow.AINode} message AINode
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            AINode.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults) {
                    object.ports = [];
                    object.properties = [];
                }
                if (options.defaults) {
                    object.id = "";
                    object.type = "";
                    object.name = "";
                    object.position = null;
                    object.state = "";
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = message.type;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.position != null && message.hasOwnProperty("position"))
                    object.position = $root.synapse.workflow.Position.toObject(message.position, options);
                if (message.description != null && message.hasOwnProperty("description")) {
                    object.description = message.description;
                    if (options.oneofs)
                        object._description = "description";
                }
                if (message.ports && message.ports.length) {
                    object.ports = [];
                    for (var j = 0; j < message.ports.length; ++j)
                        object.ports[j] = $root.synapse.workflow.NodePort.toObject(message.ports[j], options);
                }
                if (message.properties && message.properties.length) {
                    object.properties = [];
                    for (var j = 0; j < message.properties.length; ++j)
                        object.properties[j] = $root.synapse.workflow.NodeProperty.toObject(message.properties[j], options);
                }
                if (message.category != null && message.hasOwnProperty("category")) {
                    object.category = message.category;
                    if (options.oneofs)
                        object._category = "category";
                }
                if (message.icon != null && message.hasOwnProperty("icon")) {
                    object.icon = message.icon;
                    if (options.oneofs)
                        object._icon = "icon";
                }
                if (message.state != null && message.hasOwnProperty("state"))
                    object.state = message.state;
                if (message.errorMessage != null && message.hasOwnProperty("errorMessage")) {
                    object.errorMessage = message.errorMessage;
                    if (options.oneofs)
                        object._errorMessage = "errorMessage";
                }
                return object;
            };

            /**
             * Converts this AINode to JSON.
             * @function toJSON
             * @memberof synapse.workflow.AINode
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            AINode.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for AINode
             * @function getTypeUrl
             * @memberof synapse.workflow.AINode
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            AINode.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/synapse.workflow.AINode";
            };

            return AINode;
        })();

        workflow.NodeConnector = (function() {

            /**
             * Properties of a NodeConnector.
             * @memberof synapse.workflow
             * @interface INodeConnector
             * @property {string|null} [id] NodeConnector id
             * @property {string|null} [sourceNodeId] NodeConnector sourceNodeId
             * @property {string|null} [sourcePortId] NodeConnector sourcePortId
             * @property {string|null} [targetNodeId] NodeConnector targetNodeId
             * @property {string|null} [targetPortId] NodeConnector targetPortId
             */

            /**
             * Constructs a new NodeConnector.
             * @memberof synapse.workflow
             * @classdesc Represents a NodeConnector.
             * @implements INodeConnector
             * @constructor
             * @param {synapse.workflow.INodeConnector=} [properties] Properties to set
             */
            function NodeConnector(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * NodeConnector id.
             * @member {string} id
             * @memberof synapse.workflow.NodeConnector
             * @instance
             */
            NodeConnector.prototype.id = "";

            /**
             * NodeConnector sourceNodeId.
             * @member {string} sourceNodeId
             * @memberof synapse.workflow.NodeConnector
             * @instance
             */
            NodeConnector.prototype.sourceNodeId = "";

            /**
             * NodeConnector sourcePortId.
             * @member {string} sourcePortId
             * @memberof synapse.workflow.NodeConnector
             * @instance
             */
            NodeConnector.prototype.sourcePortId = "";

            /**
             * NodeConnector targetNodeId.
             * @member {string} targetNodeId
             * @memberof synapse.workflow.NodeConnector
             * @instance
             */
            NodeConnector.prototype.targetNodeId = "";

            /**
             * NodeConnector targetPortId.
             * @member {string} targetPortId
             * @memberof synapse.workflow.NodeConnector
             * @instance
             */
            NodeConnector.prototype.targetPortId = "";

            /**
             * Creates a new NodeConnector instance using the specified properties.
             * @function create
             * @memberof synapse.workflow.NodeConnector
             * @static
             * @param {synapse.workflow.INodeConnector=} [properties] Properties to set
             * @returns {synapse.workflow.NodeConnector} NodeConnector instance
             */
            NodeConnector.create = function create(properties) {
                return new NodeConnector(properties);
            };

            /**
             * Encodes the specified NodeConnector message. Does not implicitly {@link synapse.workflow.NodeConnector.verify|verify} messages.
             * @function encode
             * @memberof synapse.workflow.NodeConnector
             * @static
             * @param {synapse.workflow.INodeConnector} message NodeConnector message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            NodeConnector.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.sourceNodeId != null && Object.hasOwnProperty.call(message, "sourceNodeId"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.sourceNodeId);
                if (message.sourcePortId != null && Object.hasOwnProperty.call(message, "sourcePortId"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.sourcePortId);
                if (message.targetNodeId != null && Object.hasOwnProperty.call(message, "targetNodeId"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.targetNodeId);
                if (message.targetPortId != null && Object.hasOwnProperty.call(message, "targetPortId"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.targetPortId);
                return writer;
            };

            /**
             * Encodes the specified NodeConnector message, length delimited. Does not implicitly {@link synapse.workflow.NodeConnector.verify|verify} messages.
             * @function encodeDelimited
             * @memberof synapse.workflow.NodeConnector
             * @static
             * @param {synapse.workflow.INodeConnector} message NodeConnector message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            NodeConnector.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a NodeConnector message from the specified reader or buffer.
             * @function decode
             * @memberof synapse.workflow.NodeConnector
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {synapse.workflow.NodeConnector} NodeConnector
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            NodeConnector.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.synapse.workflow.NodeConnector();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.string();
                            break;
                        }
                    case 2: {
                            message.sourceNodeId = reader.string();
                            break;
                        }
                    case 3: {
                            message.sourcePortId = reader.string();
                            break;
                        }
                    case 4: {
                            message.targetNodeId = reader.string();
                            break;
                        }
                    case 5: {
                            message.targetPortId = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a NodeConnector message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof synapse.workflow.NodeConnector
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {synapse.workflow.NodeConnector} NodeConnector
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            NodeConnector.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a NodeConnector message.
             * @function verify
             * @memberof synapse.workflow.NodeConnector
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            NodeConnector.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.sourceNodeId != null && message.hasOwnProperty("sourceNodeId"))
                    if (!$util.isString(message.sourceNodeId))
                        return "sourceNodeId: string expected";
                if (message.sourcePortId != null && message.hasOwnProperty("sourcePortId"))
                    if (!$util.isString(message.sourcePortId))
                        return "sourcePortId: string expected";
                if (message.targetNodeId != null && message.hasOwnProperty("targetNodeId"))
                    if (!$util.isString(message.targetNodeId))
                        return "targetNodeId: string expected";
                if (message.targetPortId != null && message.hasOwnProperty("targetPortId"))
                    if (!$util.isString(message.targetPortId))
                        return "targetPortId: string expected";
                return null;
            };

            /**
             * Creates a NodeConnector message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof synapse.workflow.NodeConnector
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {synapse.workflow.NodeConnector} NodeConnector
             */
            NodeConnector.fromObject = function fromObject(object) {
                if (object instanceof $root.synapse.workflow.NodeConnector)
                    return object;
                var message = new $root.synapse.workflow.NodeConnector();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.sourceNodeId != null)
                    message.sourceNodeId = String(object.sourceNodeId);
                if (object.sourcePortId != null)
                    message.sourcePortId = String(object.sourcePortId);
                if (object.targetNodeId != null)
                    message.targetNodeId = String(object.targetNodeId);
                if (object.targetPortId != null)
                    message.targetPortId = String(object.targetPortId);
                return message;
            };

            /**
             * Creates a plain object from a NodeConnector message. Also converts values to other types if specified.
             * @function toObject
             * @memberof synapse.workflow.NodeConnector
             * @static
             * @param {synapse.workflow.NodeConnector} message NodeConnector
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            NodeConnector.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.id = "";
                    object.sourceNodeId = "";
                    object.sourcePortId = "";
                    object.targetNodeId = "";
                    object.targetPortId = "";
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.sourceNodeId != null && message.hasOwnProperty("sourceNodeId"))
                    object.sourceNodeId = message.sourceNodeId;
                if (message.sourcePortId != null && message.hasOwnProperty("sourcePortId"))
                    object.sourcePortId = message.sourcePortId;
                if (message.targetNodeId != null && message.hasOwnProperty("targetNodeId"))
                    object.targetNodeId = message.targetNodeId;
                if (message.targetPortId != null && message.hasOwnProperty("targetPortId"))
                    object.targetPortId = message.targetPortId;
                return object;
            };

            /**
             * Converts this NodeConnector to JSON.
             * @function toJSON
             * @memberof synapse.workflow.NodeConnector
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            NodeConnector.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for NodeConnector
             * @function getTypeUrl
             * @memberof synapse.workflow.NodeConnector
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            NodeConnector.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/synapse.workflow.NodeConnector";
            };

            return NodeConnector;
        })();

        workflow.WorkflowState = (function() {

            /**
             * Properties of a WorkflowState.
             * @memberof synapse.workflow
             * @interface IWorkflowState
             * @property {string|null} [id] WorkflowState id
             * @property {string|null} [name] WorkflowState name
             * @property {Array.<synapse.workflow.INote>|null} [notes] WorkflowState notes
             * @property {Array.<synapse.workflow.IConnection>|null} [connections] WorkflowState connections
             * @property {number|null} [canvasScale] WorkflowState canvasScale
             * @property {number|null} [canvasOffsetX] WorkflowState canvasOffsetX
             * @property {number|null} [canvasOffsetY] WorkflowState canvasOffsetY
             * @property {Array.<synapse.workflow.IKanbanBoard>|null} [kanbanBoards] WorkflowState kanbanBoards
             * @property {Array.<synapse.workflow.IAINode>|null} [aiNodes] WorkflowState aiNodes
             * @property {Array.<synapse.workflow.INodeConnector>|null} [nodeConnectors] WorkflowState nodeConnectors
             * @property {Object.<string,string>|null} [metadata] WorkflowState metadata
             */

            /**
             * Constructs a new WorkflowState.
             * @memberof synapse.workflow
             * @classdesc Represents a WorkflowState.
             * @implements IWorkflowState
             * @constructor
             * @param {synapse.workflow.IWorkflowState=} [properties] Properties to set
             */
            function WorkflowState(properties) {
                this.notes = [];
                this.connections = [];
                this.kanbanBoards = [];
                this.aiNodes = [];
                this.nodeConnectors = [];
                this.metadata = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * WorkflowState id.
             * @member {string} id
             * @memberof synapse.workflow.WorkflowState
             * @instance
             */
            WorkflowState.prototype.id = "";

            /**
             * WorkflowState name.
             * @member {string} name
             * @memberof synapse.workflow.WorkflowState
             * @instance
             */
            WorkflowState.prototype.name = "";

            /**
             * WorkflowState notes.
             * @member {Array.<synapse.workflow.INote>} notes
             * @memberof synapse.workflow.WorkflowState
             * @instance
             */
            WorkflowState.prototype.notes = $util.emptyArray;

            /**
             * WorkflowState connections.
             * @member {Array.<synapse.workflow.IConnection>} connections
             * @memberof synapse.workflow.WorkflowState
             * @instance
             */
            WorkflowState.prototype.connections = $util.emptyArray;

            /**
             * WorkflowState canvasScale.
             * @member {number|null|undefined} canvasScale
             * @memberof synapse.workflow.WorkflowState
             * @instance
             */
            WorkflowState.prototype.canvasScale = null;

            /**
             * WorkflowState canvasOffsetX.
             * @member {number|null|undefined} canvasOffsetX
             * @memberof synapse.workflow.WorkflowState
             * @instance
             */
            WorkflowState.prototype.canvasOffsetX = null;

            /**
             * WorkflowState canvasOffsetY.
             * @member {number|null|undefined} canvasOffsetY
             * @memberof synapse.workflow.WorkflowState
             * @instance
             */
            WorkflowState.prototype.canvasOffsetY = null;

            /**
             * WorkflowState kanbanBoards.
             * @member {Array.<synapse.workflow.IKanbanBoard>} kanbanBoards
             * @memberof synapse.workflow.WorkflowState
             * @instance
             */
            WorkflowState.prototype.kanbanBoards = $util.emptyArray;

            /**
             * WorkflowState aiNodes.
             * @member {Array.<synapse.workflow.IAINode>} aiNodes
             * @memberof synapse.workflow.WorkflowState
             * @instance
             */
            WorkflowState.prototype.aiNodes = $util.emptyArray;

            /**
             * WorkflowState nodeConnectors.
             * @member {Array.<synapse.workflow.INodeConnector>} nodeConnectors
             * @memberof synapse.workflow.WorkflowState
             * @instance
             */
            WorkflowState.prototype.nodeConnectors = $util.emptyArray;

            /**
             * WorkflowState metadata.
             * @member {Object.<string,string>} metadata
             * @memberof synapse.workflow.WorkflowState
             * @instance
             */
            WorkflowState.prototype.metadata = $util.emptyObject;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * WorkflowState _canvasScale.
             * @member {"canvasScale"|undefined} _canvasScale
             * @memberof synapse.workflow.WorkflowState
             * @instance
             */
            Object.defineProperty(WorkflowState.prototype, "_canvasScale", {
                get: $util.oneOfGetter($oneOfFields = ["canvasScale"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * WorkflowState _canvasOffsetX.
             * @member {"canvasOffsetX"|undefined} _canvasOffsetX
             * @memberof synapse.workflow.WorkflowState
             * @instance
             */
            Object.defineProperty(WorkflowState.prototype, "_canvasOffsetX", {
                get: $util.oneOfGetter($oneOfFields = ["canvasOffsetX"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * WorkflowState _canvasOffsetY.
             * @member {"canvasOffsetY"|undefined} _canvasOffsetY
             * @memberof synapse.workflow.WorkflowState
             * @instance
             */
            Object.defineProperty(WorkflowState.prototype, "_canvasOffsetY", {
                get: $util.oneOfGetter($oneOfFields = ["canvasOffsetY"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new WorkflowState instance using the specified properties.
             * @function create
             * @memberof synapse.workflow.WorkflowState
             * @static
             * @param {synapse.workflow.IWorkflowState=} [properties] Properties to set
             * @returns {synapse.workflow.WorkflowState} WorkflowState instance
             */
            WorkflowState.create = function create(properties) {
                return new WorkflowState(properties);
            };

            /**
             * Encodes the specified WorkflowState message. Does not implicitly {@link synapse.workflow.WorkflowState.verify|verify} messages.
             * @function encode
             * @memberof synapse.workflow.WorkflowState
             * @static
             * @param {synapse.workflow.IWorkflowState} message WorkflowState message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WorkflowState.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                if (message.notes != null && message.notes.length)
                    for (var i = 0; i < message.notes.length; ++i)
                        $root.synapse.workflow.Note.encode(message.notes[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.connections != null && message.connections.length)
                    for (var i = 0; i < message.connections.length; ++i)
                        $root.synapse.workflow.Connection.encode(message.connections[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.canvasScale != null && Object.hasOwnProperty.call(message, "canvasScale"))
                    writer.uint32(/* id 5, wireType 1 =*/41).double(message.canvasScale);
                if (message.canvasOffsetX != null && Object.hasOwnProperty.call(message, "canvasOffsetX"))
                    writer.uint32(/* id 6, wireType 1 =*/49).double(message.canvasOffsetX);
                if (message.canvasOffsetY != null && Object.hasOwnProperty.call(message, "canvasOffsetY"))
                    writer.uint32(/* id 7, wireType 1 =*/57).double(message.canvasOffsetY);
                if (message.kanbanBoards != null && message.kanbanBoards.length)
                    for (var i = 0; i < message.kanbanBoards.length; ++i)
                        $root.synapse.workflow.KanbanBoard.encode(message.kanbanBoards[i], writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
                if (message.aiNodes != null && message.aiNodes.length)
                    for (var i = 0; i < message.aiNodes.length; ++i)
                        $root.synapse.workflow.AINode.encode(message.aiNodes[i], writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
                if (message.nodeConnectors != null && message.nodeConnectors.length)
                    for (var i = 0; i < message.nodeConnectors.length; ++i)
                        $root.synapse.workflow.NodeConnector.encode(message.nodeConnectors[i], writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
                if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                    for (var keys = Object.keys(message.metadata), i = 0; i < keys.length; ++i)
                        writer.uint32(/* id 11, wireType 2 =*/90).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.metadata[keys[i]]).ldelim();
                return writer;
            };

            /**
             * Encodes the specified WorkflowState message, length delimited. Does not implicitly {@link synapse.workflow.WorkflowState.verify|verify} messages.
             * @function encodeDelimited
             * @memberof synapse.workflow.WorkflowState
             * @static
             * @param {synapse.workflow.IWorkflowState} message WorkflowState message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WorkflowState.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a WorkflowState message from the specified reader or buffer.
             * @function decode
             * @memberof synapse.workflow.WorkflowState
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {synapse.workflow.WorkflowState} WorkflowState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WorkflowState.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.synapse.workflow.WorkflowState(), key, value;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.string();
                            break;
                        }
                    case 2: {
                            message.name = reader.string();
                            break;
                        }
                    case 3: {
                            if (!(message.notes && message.notes.length))
                                message.notes = [];
                            message.notes.push($root.synapse.workflow.Note.decode(reader, reader.uint32()));
                            break;
                        }
                    case 4: {
                            if (!(message.connections && message.connections.length))
                                message.connections = [];
                            message.connections.push($root.synapse.workflow.Connection.decode(reader, reader.uint32()));
                            break;
                        }
                    case 5: {
                            message.canvasScale = reader.double();
                            break;
                        }
                    case 6: {
                            message.canvasOffsetX = reader.double();
                            break;
                        }
                    case 7: {
                            message.canvasOffsetY = reader.double();
                            break;
                        }
                    case 8: {
                            if (!(message.kanbanBoards && message.kanbanBoards.length))
                                message.kanbanBoards = [];
                            message.kanbanBoards.push($root.synapse.workflow.KanbanBoard.decode(reader, reader.uint32()));
                            break;
                        }
                    case 9: {
                            if (!(message.aiNodes && message.aiNodes.length))
                                message.aiNodes = [];
                            message.aiNodes.push($root.synapse.workflow.AINode.decode(reader, reader.uint32()));
                            break;
                        }
                    case 10: {
                            if (!(message.nodeConnectors && message.nodeConnectors.length))
                                message.nodeConnectors = [];
                            message.nodeConnectors.push($root.synapse.workflow.NodeConnector.decode(reader, reader.uint32()));
                            break;
                        }
                    case 11: {
                            if (message.metadata === $util.emptyObject)
                                message.metadata = {};
                            var end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = "";
                            while (reader.pos < end2) {
                                var tag2 = reader.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = reader.string();
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.metadata[key] = value;
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a WorkflowState message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof synapse.workflow.WorkflowState
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {synapse.workflow.WorkflowState} WorkflowState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WorkflowState.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a WorkflowState message.
             * @function verify
             * @memberof synapse.workflow.WorkflowState
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            WorkflowState.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.notes != null && message.hasOwnProperty("notes")) {
                    if (!Array.isArray(message.notes))
                        return "notes: array expected";
                    for (var i = 0; i < message.notes.length; ++i) {
                        var error = $root.synapse.workflow.Note.verify(message.notes[i]);
                        if (error)
                            return "notes." + error;
                    }
                }
                if (message.connections != null && message.hasOwnProperty("connections")) {
                    if (!Array.isArray(message.connections))
                        return "connections: array expected";
                    for (var i = 0; i < message.connections.length; ++i) {
                        var error = $root.synapse.workflow.Connection.verify(message.connections[i]);
                        if (error)
                            return "connections." + error;
                    }
                }
                if (message.canvasScale != null && message.hasOwnProperty("canvasScale")) {
                    properties._canvasScale = 1;
                    if (typeof message.canvasScale !== "number")
                        return "canvasScale: number expected";
                }
                if (message.canvasOffsetX != null && message.hasOwnProperty("canvasOffsetX")) {
                    properties._canvasOffsetX = 1;
                    if (typeof message.canvasOffsetX !== "number")
                        return "canvasOffsetX: number expected";
                }
                if (message.canvasOffsetY != null && message.hasOwnProperty("canvasOffsetY")) {
                    properties._canvasOffsetY = 1;
                    if (typeof message.canvasOffsetY !== "number")
                        return "canvasOffsetY: number expected";
                }
                if (message.kanbanBoards != null && message.hasOwnProperty("kanbanBoards")) {
                    if (!Array.isArray(message.kanbanBoards))
                        return "kanbanBoards: array expected";
                    for (var i = 0; i < message.kanbanBoards.length; ++i) {
                        var error = $root.synapse.workflow.KanbanBoard.verify(message.kanbanBoards[i]);
                        if (error)
                            return "kanbanBoards." + error;
                    }
                }
                if (message.aiNodes != null && message.hasOwnProperty("aiNodes")) {
                    if (!Array.isArray(message.aiNodes))
                        return "aiNodes: array expected";
                    for (var i = 0; i < message.aiNodes.length; ++i) {
                        var error = $root.synapse.workflow.AINode.verify(message.aiNodes[i]);
                        if (error)
                            return "aiNodes." + error;
                    }
                }
                if (message.nodeConnectors != null && message.hasOwnProperty("nodeConnectors")) {
                    if (!Array.isArray(message.nodeConnectors))
                        return "nodeConnectors: array expected";
                    for (var i = 0; i < message.nodeConnectors.length; ++i) {
                        var error = $root.synapse.workflow.NodeConnector.verify(message.nodeConnectors[i]);
                        if (error)
                            return "nodeConnectors." + error;
                    }
                }
                if (message.metadata != null && message.hasOwnProperty("metadata")) {
                    if (!$util.isObject(message.metadata))
                        return "metadata: object expected";
                    var key = Object.keys(message.metadata);
                    for (var i = 0; i < key.length; ++i)
                        if (!$util.isString(message.metadata[key[i]]))
                            return "metadata: string{k:string} expected";
                }
                return null;
            };

            /**
             * Creates a WorkflowState message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof synapse.workflow.WorkflowState
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {synapse.workflow.WorkflowState} WorkflowState
             */
            WorkflowState.fromObject = function fromObject(object) {
                if (object instanceof $root.synapse.workflow.WorkflowState)
                    return object;
                var message = new $root.synapse.workflow.WorkflowState();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.name != null)
                    message.name = String(object.name);
                if (object.notes) {
                    if (!Array.isArray(object.notes))
                        throw TypeError(".synapse.workflow.WorkflowState.notes: array expected");
                    message.notes = [];
                    for (var i = 0; i < object.notes.length; ++i) {
                        if (typeof object.notes[i] !== "object")
                            throw TypeError(".synapse.workflow.WorkflowState.notes: object expected");
                        message.notes[i] = $root.synapse.workflow.Note.fromObject(object.notes[i]);
                    }
                }
                if (object.connections) {
                    if (!Array.isArray(object.connections))
                        throw TypeError(".synapse.workflow.WorkflowState.connections: array expected");
                    message.connections = [];
                    for (var i = 0; i < object.connections.length; ++i) {
                        if (typeof object.connections[i] !== "object")
                            throw TypeError(".synapse.workflow.WorkflowState.connections: object expected");
                        message.connections[i] = $root.synapse.workflow.Connection.fromObject(object.connections[i]);
                    }
                }
                if (object.canvasScale != null)
                    message.canvasScale = Number(object.canvasScale);
                if (object.canvasOffsetX != null)
                    message.canvasOffsetX = Number(object.canvasOffsetX);
                if (object.canvasOffsetY != null)
                    message.canvasOffsetY = Number(object.canvasOffsetY);
                if (object.kanbanBoards) {
                    if (!Array.isArray(object.kanbanBoards))
                        throw TypeError(".synapse.workflow.WorkflowState.kanbanBoards: array expected");
                    message.kanbanBoards = [];
                    for (var i = 0; i < object.kanbanBoards.length; ++i) {
                        if (typeof object.kanbanBoards[i] !== "object")
                            throw TypeError(".synapse.workflow.WorkflowState.kanbanBoards: object expected");
                        message.kanbanBoards[i] = $root.synapse.workflow.KanbanBoard.fromObject(object.kanbanBoards[i]);
                    }
                }
                if (object.aiNodes) {
                    if (!Array.isArray(object.aiNodes))
                        throw TypeError(".synapse.workflow.WorkflowState.aiNodes: array expected");
                    message.aiNodes = [];
                    for (var i = 0; i < object.aiNodes.length; ++i) {
                        if (typeof object.aiNodes[i] !== "object")
                            throw TypeError(".synapse.workflow.WorkflowState.aiNodes: object expected");
                        message.aiNodes[i] = $root.synapse.workflow.AINode.fromObject(object.aiNodes[i]);
                    }
                }
                if (object.nodeConnectors) {
                    if (!Array.isArray(object.nodeConnectors))
                        throw TypeError(".synapse.workflow.WorkflowState.nodeConnectors: array expected");
                    message.nodeConnectors = [];
                    for (var i = 0; i < object.nodeConnectors.length; ++i) {
                        if (typeof object.nodeConnectors[i] !== "object")
                            throw TypeError(".synapse.workflow.WorkflowState.nodeConnectors: object expected");
                        message.nodeConnectors[i] = $root.synapse.workflow.NodeConnector.fromObject(object.nodeConnectors[i]);
                    }
                }
                if (object.metadata) {
                    if (typeof object.metadata !== "object")
                        throw TypeError(".synapse.workflow.WorkflowState.metadata: object expected");
                    message.metadata = {};
                    for (var keys = Object.keys(object.metadata), i = 0; i < keys.length; ++i)
                        message.metadata[keys[i]] = String(object.metadata[keys[i]]);
                }
                return message;
            };

            /**
             * Creates a plain object from a WorkflowState message. Also converts values to other types if specified.
             * @function toObject
             * @memberof synapse.workflow.WorkflowState
             * @static
             * @param {synapse.workflow.WorkflowState} message WorkflowState
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            WorkflowState.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults) {
                    object.notes = [];
                    object.connections = [];
                    object.kanbanBoards = [];
                    object.aiNodes = [];
                    object.nodeConnectors = [];
                }
                if (options.objects || options.defaults)
                    object.metadata = {};
                if (options.defaults) {
                    object.id = "";
                    object.name = "";
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.notes && message.notes.length) {
                    object.notes = [];
                    for (var j = 0; j < message.notes.length; ++j)
                        object.notes[j] = $root.synapse.workflow.Note.toObject(message.notes[j], options);
                }
                if (message.connections && message.connections.length) {
                    object.connections = [];
                    for (var j = 0; j < message.connections.length; ++j)
                        object.connections[j] = $root.synapse.workflow.Connection.toObject(message.connections[j], options);
                }
                if (message.canvasScale != null && message.hasOwnProperty("canvasScale")) {
                    object.canvasScale = options.json && !isFinite(message.canvasScale) ? String(message.canvasScale) : message.canvasScale;
                    if (options.oneofs)
                        object._canvasScale = "canvasScale";
                }
                if (message.canvasOffsetX != null && message.hasOwnProperty("canvasOffsetX")) {
                    object.canvasOffsetX = options.json && !isFinite(message.canvasOffsetX) ? String(message.canvasOffsetX) : message.canvasOffsetX;
                    if (options.oneofs)
                        object._canvasOffsetX = "canvasOffsetX";
                }
                if (message.canvasOffsetY != null && message.hasOwnProperty("canvasOffsetY")) {
                    object.canvasOffsetY = options.json && !isFinite(message.canvasOffsetY) ? String(message.canvasOffsetY) : message.canvasOffsetY;
                    if (options.oneofs)
                        object._canvasOffsetY = "canvasOffsetY";
                }
                if (message.kanbanBoards && message.kanbanBoards.length) {
                    object.kanbanBoards = [];
                    for (var j = 0; j < message.kanbanBoards.length; ++j)
                        object.kanbanBoards[j] = $root.synapse.workflow.KanbanBoard.toObject(message.kanbanBoards[j], options);
                }
                if (message.aiNodes && message.aiNodes.length) {
                    object.aiNodes = [];
                    for (var j = 0; j < message.aiNodes.length; ++j)
                        object.aiNodes[j] = $root.synapse.workflow.AINode.toObject(message.aiNodes[j], options);
                }
                if (message.nodeConnectors && message.nodeConnectors.length) {
                    object.nodeConnectors = [];
                    for (var j = 0; j < message.nodeConnectors.length; ++j)
                        object.nodeConnectors[j] = $root.synapse.workflow.NodeConnector.toObject(message.nodeConnectors[j], options);
                }
                var keys2;
                if (message.metadata && (keys2 = Object.keys(message.metadata)).length) {
                    object.metadata = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.metadata[keys2[j]] = message.metadata[keys2[j]];
                }
                return object;
            };

            /**
             * Converts this WorkflowState to JSON.
             * @function toJSON
             * @memberof synapse.workflow.WorkflowState
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            WorkflowState.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for WorkflowState
             * @function getTypeUrl
             * @memberof synapse.workflow.WorkflowState
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            WorkflowState.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/synapse.workflow.WorkflowState";
            };

            return WorkflowState;
        })();

        return workflow;
    })();

    return synapse;
})();

module.exports = $root;
