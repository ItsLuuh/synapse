import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace synapse. */
export namespace synapse {

    /** Namespace workflow. */
    namespace workflow {

        /** Properties of a Position. */
        interface IPosition {

            /** Position x */
            x?: (number|null);

            /** Position y */
            y?: (number|null);
        }

        /** Represents a Position. */
        class Position implements IPosition {

            /**
             * Constructs a new Position.
             * @param [properties] Properties to set
             */
            constructor(properties?: synapse.workflow.IPosition);

            /** Position x. */
            public x: number;

            /** Position y. */
            public y: number;

            /**
             * Creates a new Position instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Position instance
             */
            public static create(properties?: synapse.workflow.IPosition): synapse.workflow.Position;

            /**
             * Encodes the specified Position message. Does not implicitly {@link synapse.workflow.Position.verify|verify} messages.
             * @param message Position message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: synapse.workflow.IPosition, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Position message, length delimited. Does not implicitly {@link synapse.workflow.Position.verify|verify} messages.
             * @param message Position message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: synapse.workflow.IPosition, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Position message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Position
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): synapse.workflow.Position;

            /**
             * Decodes a Position message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Position
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): synapse.workflow.Position;

            /**
             * Verifies a Position message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Position message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Position
             */
            public static fromObject(object: { [k: string]: any }): synapse.workflow.Position;

            /**
             * Creates a plain object from a Position message. Also converts values to other types if specified.
             * @param message Position
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: synapse.workflow.Position, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Position to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Position
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Size. */
        interface ISize {

            /** Size width */
            width?: (number|null);

            /** Size height */
            height?: (number|null);
        }

        /** Represents a Size. */
        class Size implements ISize {

            /**
             * Constructs a new Size.
             * @param [properties] Properties to set
             */
            constructor(properties?: synapse.workflow.ISize);

            /** Size width. */
            public width: number;

            /** Size height. */
            public height: number;

            /**
             * Creates a new Size instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Size instance
             */
            public static create(properties?: synapse.workflow.ISize): synapse.workflow.Size;

            /**
             * Encodes the specified Size message. Does not implicitly {@link synapse.workflow.Size.verify|verify} messages.
             * @param message Size message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: synapse.workflow.ISize, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Size message, length delimited. Does not implicitly {@link synapse.workflow.Size.verify|verify} messages.
             * @param message Size message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: synapse.workflow.ISize, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Size message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Size
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): synapse.workflow.Size;

            /**
             * Decodes a Size message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Size
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): synapse.workflow.Size;

            /**
             * Verifies a Size message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Size message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Size
             */
            public static fromObject(object: { [k: string]: any }): synapse.workflow.Size;

            /**
             * Creates a plain object from a Size message. Also converts values to other types if specified.
             * @param message Size
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: synapse.workflow.Size, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Size to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Size
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Note. */
        interface INote {

            /** Note id */
            id?: (string|null);

            /** Note title */
            title?: (string|null);

            /** Note position */
            position?: (synapse.workflow.IPosition|null);

            /** Note size */
            size?: (synapse.workflow.ISize|null);

            /** Note content */
            content?: (string|null);
        }

        /** Represents a Note. */
        class Note implements INote {

            /**
             * Constructs a new Note.
             * @param [properties] Properties to set
             */
            constructor(properties?: synapse.workflow.INote);

            /** Note id. */
            public id: string;

            /** Note title. */
            public title: string;

            /** Note position. */
            public position?: (synapse.workflow.IPosition|null);

            /** Note size. */
            public size?: (synapse.workflow.ISize|null);

            /** Note content. */
            public content: string;

            /**
             * Creates a new Note instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Note instance
             */
            public static create(properties?: synapse.workflow.INote): synapse.workflow.Note;

            /**
             * Encodes the specified Note message. Does not implicitly {@link synapse.workflow.Note.verify|verify} messages.
             * @param message Note message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: synapse.workflow.INote, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Note message, length delimited. Does not implicitly {@link synapse.workflow.Note.verify|verify} messages.
             * @param message Note message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: synapse.workflow.INote, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Note message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Note
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): synapse.workflow.Note;

            /**
             * Decodes a Note message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Note
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): synapse.workflow.Note;

            /**
             * Verifies a Note message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Note message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Note
             */
            public static fromObject(object: { [k: string]: any }): synapse.workflow.Note;

            /**
             * Creates a plain object from a Note message. Also converts values to other types if specified.
             * @param message Note
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: synapse.workflow.Note, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Note to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Note
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ConnectionStyle. */
        interface IConnectionStyle {

            /** ConnectionStyle stroke */
            stroke?: (string|null);

            /** ConnectionStyle strokeWidth */
            strokeWidth?: (number|null);

            /** ConnectionStyle dashArray */
            dashArray?: (string|null);

            /** ConnectionStyle opacity */
            opacity?: (number|null);

            /** ConnectionStyle index */
            index?: (number|null);
        }

        /** Represents a ConnectionStyle. */
        class ConnectionStyle implements IConnectionStyle {

            /**
             * Constructs a new ConnectionStyle.
             * @param [properties] Properties to set
             */
            constructor(properties?: synapse.workflow.IConnectionStyle);

            /** ConnectionStyle stroke. */
            public stroke: string;

            /** ConnectionStyle strokeWidth. */
            public strokeWidth: number;

            /** ConnectionStyle dashArray. */
            public dashArray: string;

            /** ConnectionStyle opacity. */
            public opacity: number;

            /** ConnectionStyle index. */
            public index: number;

            /**
             * Creates a new ConnectionStyle instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConnectionStyle instance
             */
            public static create(properties?: synapse.workflow.IConnectionStyle): synapse.workflow.ConnectionStyle;

            /**
             * Encodes the specified ConnectionStyle message. Does not implicitly {@link synapse.workflow.ConnectionStyle.verify|verify} messages.
             * @param message ConnectionStyle message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: synapse.workflow.IConnectionStyle, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConnectionStyle message, length delimited. Does not implicitly {@link synapse.workflow.ConnectionStyle.verify|verify} messages.
             * @param message ConnectionStyle message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: synapse.workflow.IConnectionStyle, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConnectionStyle message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConnectionStyle
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): synapse.workflow.ConnectionStyle;

            /**
             * Decodes a ConnectionStyle message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConnectionStyle
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): synapse.workflow.ConnectionStyle;

            /**
             * Verifies a ConnectionStyle message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConnectionStyle message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConnectionStyle
             */
            public static fromObject(object: { [k: string]: any }): synapse.workflow.ConnectionStyle;

            /**
             * Creates a plain object from a ConnectionStyle message. Also converts values to other types if specified.
             * @param message ConnectionStyle
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: synapse.workflow.ConnectionStyle, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConnectionStyle to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ConnectionStyle
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Connection. */
        interface IConnection {

            /** Connection id */
            id?: (string|null);

            /** Connection startElementId */
            startElementId?: (string|null);

            /** Connection startPortPosition */
            startPortPosition?: (string|null);

            /** Connection endElementId */
            endElementId?: (string|null);

            /** Connection endPortPosition */
            endPortPosition?: (string|null);

            /** Connection label */
            label?: (string|null);

            /** Connection style */
            style?: (synapse.workflow.IConnectionStyle|null);
        }

        /** Represents a Connection. */
        class Connection implements IConnection {

            /**
             * Constructs a new Connection.
             * @param [properties] Properties to set
             */
            constructor(properties?: synapse.workflow.IConnection);

            /** Connection id. */
            public id: string;

            /** Connection startElementId. */
            public startElementId: string;

            /** Connection startPortPosition. */
            public startPortPosition: string;

            /** Connection endElementId. */
            public endElementId: string;

            /** Connection endPortPosition. */
            public endPortPosition: string;

            /** Connection label. */
            public label?: (string|null);

            /** Connection style. */
            public style?: (synapse.workflow.IConnectionStyle|null);

            /** Connection _label. */
            public _label?: "label";

            /** Connection _style. */
            public _style?: "style";

            /**
             * Creates a new Connection instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Connection instance
             */
            public static create(properties?: synapse.workflow.IConnection): synapse.workflow.Connection;

            /**
             * Encodes the specified Connection message. Does not implicitly {@link synapse.workflow.Connection.verify|verify} messages.
             * @param message Connection message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: synapse.workflow.IConnection, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Connection message, length delimited. Does not implicitly {@link synapse.workflow.Connection.verify|verify} messages.
             * @param message Connection message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: synapse.workflow.IConnection, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Connection message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Connection
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): synapse.workflow.Connection;

            /**
             * Decodes a Connection message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Connection
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): synapse.workflow.Connection;

            /**
             * Verifies a Connection message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Connection message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Connection
             */
            public static fromObject(object: { [k: string]: any }): synapse.workflow.Connection;

            /**
             * Creates a plain object from a Connection message. Also converts values to other types if specified.
             * @param message Connection
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: synapse.workflow.Connection, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Connection to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Connection
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a KanbanCard. */
        interface IKanbanCard {

            /** KanbanCard id */
            id?: (string|null);

            /** KanbanCard title */
            title?: (string|null);

            /** KanbanCard content */
            content?: (string|null);

            /** KanbanCard order */
            order?: (number|null);
        }

        /** Represents a KanbanCard. */
        class KanbanCard implements IKanbanCard {

            /**
             * Constructs a new KanbanCard.
             * @param [properties] Properties to set
             */
            constructor(properties?: synapse.workflow.IKanbanCard);

            /** KanbanCard id. */
            public id: string;

            /** KanbanCard title. */
            public title: string;

            /** KanbanCard content. */
            public content?: (string|null);

            /** KanbanCard order. */
            public order: number;

            /** KanbanCard _content. */
            public _content?: "content";

            /**
             * Creates a new KanbanCard instance using the specified properties.
             * @param [properties] Properties to set
             * @returns KanbanCard instance
             */
            public static create(properties?: synapse.workflow.IKanbanCard): synapse.workflow.KanbanCard;

            /**
             * Encodes the specified KanbanCard message. Does not implicitly {@link synapse.workflow.KanbanCard.verify|verify} messages.
             * @param message KanbanCard message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: synapse.workflow.IKanbanCard, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified KanbanCard message, length delimited. Does not implicitly {@link synapse.workflow.KanbanCard.verify|verify} messages.
             * @param message KanbanCard message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: synapse.workflow.IKanbanCard, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a KanbanCard message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns KanbanCard
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): synapse.workflow.KanbanCard;

            /**
             * Decodes a KanbanCard message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns KanbanCard
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): synapse.workflow.KanbanCard;

            /**
             * Verifies a KanbanCard message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a KanbanCard message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns KanbanCard
             */
            public static fromObject(object: { [k: string]: any }): synapse.workflow.KanbanCard;

            /**
             * Creates a plain object from a KanbanCard message. Also converts values to other types if specified.
             * @param message KanbanCard
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: synapse.workflow.KanbanCard, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this KanbanCard to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for KanbanCard
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a KanbanColumn. */
        interface IKanbanColumn {

            /** KanbanColumn id */
            id?: (string|null);

            /** KanbanColumn title */
            title?: (string|null);

            /** KanbanColumn cards */
            cards?: (synapse.workflow.IKanbanCard[]|null);

            /** KanbanColumn order */
            order?: (number|null);
        }

        /** Represents a KanbanColumn. */
        class KanbanColumn implements IKanbanColumn {

            /**
             * Constructs a new KanbanColumn.
             * @param [properties] Properties to set
             */
            constructor(properties?: synapse.workflow.IKanbanColumn);

            /** KanbanColumn id. */
            public id: string;

            /** KanbanColumn title. */
            public title: string;

            /** KanbanColumn cards. */
            public cards: synapse.workflow.IKanbanCard[];

            /** KanbanColumn order. */
            public order: number;

            /**
             * Creates a new KanbanColumn instance using the specified properties.
             * @param [properties] Properties to set
             * @returns KanbanColumn instance
             */
            public static create(properties?: synapse.workflow.IKanbanColumn): synapse.workflow.KanbanColumn;

            /**
             * Encodes the specified KanbanColumn message. Does not implicitly {@link synapse.workflow.KanbanColumn.verify|verify} messages.
             * @param message KanbanColumn message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: synapse.workflow.IKanbanColumn, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified KanbanColumn message, length delimited. Does not implicitly {@link synapse.workflow.KanbanColumn.verify|verify} messages.
             * @param message KanbanColumn message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: synapse.workflow.IKanbanColumn, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a KanbanColumn message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns KanbanColumn
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): synapse.workflow.KanbanColumn;

            /**
             * Decodes a KanbanColumn message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns KanbanColumn
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): synapse.workflow.KanbanColumn;

            /**
             * Verifies a KanbanColumn message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a KanbanColumn message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns KanbanColumn
             */
            public static fromObject(object: { [k: string]: any }): synapse.workflow.KanbanColumn;

            /**
             * Creates a plain object from a KanbanColumn message. Also converts values to other types if specified.
             * @param message KanbanColumn
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: synapse.workflow.KanbanColumn, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this KanbanColumn to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for KanbanColumn
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a KanbanBoard. */
        interface IKanbanBoard {

            /** KanbanBoard id */
            id?: (string|null);

            /** KanbanBoard title */
            title?: (string|null);

            /** KanbanBoard columns */
            columns?: (synapse.workflow.IKanbanColumn[]|null);

            /** KanbanBoard position */
            position?: (synapse.workflow.IPosition|null);

            /** KanbanBoard size */
            size?: (synapse.workflow.ISize|null);
        }

        /** Represents a KanbanBoard. */
        class KanbanBoard implements IKanbanBoard {

            /**
             * Constructs a new KanbanBoard.
             * @param [properties] Properties to set
             */
            constructor(properties?: synapse.workflow.IKanbanBoard);

            /** KanbanBoard id. */
            public id: string;

            /** KanbanBoard title. */
            public title: string;

            /** KanbanBoard columns. */
            public columns: synapse.workflow.IKanbanColumn[];

            /** KanbanBoard position. */
            public position?: (synapse.workflow.IPosition|null);

            /** KanbanBoard size. */
            public size?: (synapse.workflow.ISize|null);

            /**
             * Creates a new KanbanBoard instance using the specified properties.
             * @param [properties] Properties to set
             * @returns KanbanBoard instance
             */
            public static create(properties?: synapse.workflow.IKanbanBoard): synapse.workflow.KanbanBoard;

            /**
             * Encodes the specified KanbanBoard message. Does not implicitly {@link synapse.workflow.KanbanBoard.verify|verify} messages.
             * @param message KanbanBoard message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: synapse.workflow.IKanbanBoard, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified KanbanBoard message, length delimited. Does not implicitly {@link synapse.workflow.KanbanBoard.verify|verify} messages.
             * @param message KanbanBoard message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: synapse.workflow.IKanbanBoard, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a KanbanBoard message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns KanbanBoard
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): synapse.workflow.KanbanBoard;

            /**
             * Decodes a KanbanBoard message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns KanbanBoard
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): synapse.workflow.KanbanBoard;

            /**
             * Verifies a KanbanBoard message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a KanbanBoard message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns KanbanBoard
             */
            public static fromObject(object: { [k: string]: any }): synapse.workflow.KanbanBoard;

            /**
             * Creates a plain object from a KanbanBoard message. Also converts values to other types if specified.
             * @param message KanbanBoard
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: synapse.workflow.KanbanBoard, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this KanbanBoard to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for KanbanBoard
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a NodePort. */
        interface INodePort {

            /** NodePort id */
            id?: (string|null);

            /** NodePort name */
            name?: (string|null);

            /** NodePort type */
            type?: (string|null);

            /** NodePort isInput */
            isInput?: (boolean|null);

            /** NodePort defaultValue */
            defaultValue?: (string|null);
        }

        /** Represents a NodePort. */
        class NodePort implements INodePort {

            /**
             * Constructs a new NodePort.
             * @param [properties] Properties to set
             */
            constructor(properties?: synapse.workflow.INodePort);

            /** NodePort id. */
            public id: string;

            /** NodePort name. */
            public name: string;

            /** NodePort type. */
            public type: string;

            /** NodePort isInput. */
            public isInput: boolean;

            /** NodePort defaultValue. */
            public defaultValue?: (string|null);

            /** NodePort _defaultValue. */
            public _defaultValue?: "defaultValue";

            /**
             * Creates a new NodePort instance using the specified properties.
             * @param [properties] Properties to set
             * @returns NodePort instance
             */
            public static create(properties?: synapse.workflow.INodePort): synapse.workflow.NodePort;

            /**
             * Encodes the specified NodePort message. Does not implicitly {@link synapse.workflow.NodePort.verify|verify} messages.
             * @param message NodePort message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: synapse.workflow.INodePort, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified NodePort message, length delimited. Does not implicitly {@link synapse.workflow.NodePort.verify|verify} messages.
             * @param message NodePort message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: synapse.workflow.INodePort, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a NodePort message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns NodePort
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): synapse.workflow.NodePort;

            /**
             * Decodes a NodePort message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns NodePort
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): synapse.workflow.NodePort;

            /**
             * Verifies a NodePort message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a NodePort message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns NodePort
             */
            public static fromObject(object: { [k: string]: any }): synapse.workflow.NodePort;

            /**
             * Creates a plain object from a NodePort message. Also converts values to other types if specified.
             * @param message NodePort
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: synapse.workflow.NodePort, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this NodePort to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for NodePort
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a NodeProperty. */
        interface INodeProperty {

            /** NodeProperty id */
            id?: (string|null);

            /** NodeProperty name */
            name?: (string|null);

            /** NodeProperty type */
            type?: (string|null);

            /** NodeProperty value */
            value?: (string|null);

            /** NodeProperty description */
            description?: (string|null);
        }

        /** Represents a NodeProperty. */
        class NodeProperty implements INodeProperty {

            /**
             * Constructs a new NodeProperty.
             * @param [properties] Properties to set
             */
            constructor(properties?: synapse.workflow.INodeProperty);

            /** NodeProperty id. */
            public id: string;

            /** NodeProperty name. */
            public name: string;

            /** NodeProperty type. */
            public type: string;

            /** NodeProperty value. */
            public value: string;

            /** NodeProperty description. */
            public description?: (string|null);

            /** NodeProperty _description. */
            public _description?: "description";

            /**
             * Creates a new NodeProperty instance using the specified properties.
             * @param [properties] Properties to set
             * @returns NodeProperty instance
             */
            public static create(properties?: synapse.workflow.INodeProperty): synapse.workflow.NodeProperty;

            /**
             * Encodes the specified NodeProperty message. Does not implicitly {@link synapse.workflow.NodeProperty.verify|verify} messages.
             * @param message NodeProperty message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: synapse.workflow.INodeProperty, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified NodeProperty message, length delimited. Does not implicitly {@link synapse.workflow.NodeProperty.verify|verify} messages.
             * @param message NodeProperty message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: synapse.workflow.INodeProperty, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a NodeProperty message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns NodeProperty
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): synapse.workflow.NodeProperty;

            /**
             * Decodes a NodeProperty message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns NodeProperty
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): synapse.workflow.NodeProperty;

            /**
             * Verifies a NodeProperty message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a NodeProperty message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns NodeProperty
             */
            public static fromObject(object: { [k: string]: any }): synapse.workflow.NodeProperty;

            /**
             * Creates a plain object from a NodeProperty message. Also converts values to other types if specified.
             * @param message NodeProperty
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: synapse.workflow.NodeProperty, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this NodeProperty to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for NodeProperty
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a AINode. */
        interface IAINode {

            /** AINode id */
            id?: (string|null);

            /** AINode type */
            type?: (string|null);

            /** AINode name */
            name?: (string|null);

            /** AINode position */
            position?: (synapse.workflow.IPosition|null);

            /** AINode description */
            description?: (string|null);

            /** AINode ports */
            ports?: (synapse.workflow.INodePort[]|null);

            /** AINode properties */
            properties?: (synapse.workflow.INodeProperty[]|null);

            /** AINode category */
            category?: (string|null);

            /** AINode icon */
            icon?: (string|null);

            /** AINode state */
            state?: (string|null);

            /** AINode errorMessage */
            errorMessage?: (string|null);
        }

        /** Represents a AINode. */
        class AINode implements IAINode {

            /**
             * Constructs a new AINode.
             * @param [properties] Properties to set
             */
            constructor(properties?: synapse.workflow.IAINode);

            /** AINode id. */
            public id: string;

            /** AINode type. */
            public type: string;

            /** AINode name. */
            public name: string;

            /** AINode position. */
            public position?: (synapse.workflow.IPosition|null);

            /** AINode description. */
            public description?: (string|null);

            /** AINode ports. */
            public ports: synapse.workflow.INodePort[];

            /** AINode properties. */
            public properties: synapse.workflow.INodeProperty[];

            /** AINode category. */
            public category?: (string|null);

            /** AINode icon. */
            public icon?: (string|null);

            /** AINode state. */
            public state: string;

            /** AINode errorMessage. */
            public errorMessage?: (string|null);

            /** AINode _description. */
            public _description?: "description";

            /** AINode _category. */
            public _category?: "category";

            /** AINode _icon. */
            public _icon?: "icon";

            /** AINode _errorMessage. */
            public _errorMessage?: "errorMessage";

            /**
             * Creates a new AINode instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AINode instance
             */
            public static create(properties?: synapse.workflow.IAINode): synapse.workflow.AINode;

            /**
             * Encodes the specified AINode message. Does not implicitly {@link synapse.workflow.AINode.verify|verify} messages.
             * @param message AINode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: synapse.workflow.IAINode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AINode message, length delimited. Does not implicitly {@link synapse.workflow.AINode.verify|verify} messages.
             * @param message AINode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: synapse.workflow.IAINode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a AINode message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AINode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): synapse.workflow.AINode;

            /**
             * Decodes a AINode message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AINode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): synapse.workflow.AINode;

            /**
             * Verifies a AINode message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a AINode message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AINode
             */
            public static fromObject(object: { [k: string]: any }): synapse.workflow.AINode;

            /**
             * Creates a plain object from a AINode message. Also converts values to other types if specified.
             * @param message AINode
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: synapse.workflow.AINode, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AINode to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for AINode
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a NodeConnector. */
        interface INodeConnector {

            /** NodeConnector id */
            id?: (string|null);

            /** NodeConnector sourceNodeId */
            sourceNodeId?: (string|null);

            /** NodeConnector sourcePortId */
            sourcePortId?: (string|null);

            /** NodeConnector targetNodeId */
            targetNodeId?: (string|null);

            /** NodeConnector targetPortId */
            targetPortId?: (string|null);
        }

        /** Represents a NodeConnector. */
        class NodeConnector implements INodeConnector {

            /**
             * Constructs a new NodeConnector.
             * @param [properties] Properties to set
             */
            constructor(properties?: synapse.workflow.INodeConnector);

            /** NodeConnector id. */
            public id: string;

            /** NodeConnector sourceNodeId. */
            public sourceNodeId: string;

            /** NodeConnector sourcePortId. */
            public sourcePortId: string;

            /** NodeConnector targetNodeId. */
            public targetNodeId: string;

            /** NodeConnector targetPortId. */
            public targetPortId: string;

            /**
             * Creates a new NodeConnector instance using the specified properties.
             * @param [properties] Properties to set
             * @returns NodeConnector instance
             */
            public static create(properties?: synapse.workflow.INodeConnector): synapse.workflow.NodeConnector;

            /**
             * Encodes the specified NodeConnector message. Does not implicitly {@link synapse.workflow.NodeConnector.verify|verify} messages.
             * @param message NodeConnector message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: synapse.workflow.INodeConnector, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified NodeConnector message, length delimited. Does not implicitly {@link synapse.workflow.NodeConnector.verify|verify} messages.
             * @param message NodeConnector message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: synapse.workflow.INodeConnector, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a NodeConnector message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns NodeConnector
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): synapse.workflow.NodeConnector;

            /**
             * Decodes a NodeConnector message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns NodeConnector
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): synapse.workflow.NodeConnector;

            /**
             * Verifies a NodeConnector message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a NodeConnector message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns NodeConnector
             */
            public static fromObject(object: { [k: string]: any }): synapse.workflow.NodeConnector;

            /**
             * Creates a plain object from a NodeConnector message. Also converts values to other types if specified.
             * @param message NodeConnector
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: synapse.workflow.NodeConnector, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this NodeConnector to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for NodeConnector
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a WorkflowState. */
        interface IWorkflowState {

            /** WorkflowState id */
            id?: (string|null);

            /** WorkflowState name */
            name?: (string|null);

            /** WorkflowState notes */
            notes?: (synapse.workflow.INote[]|null);

            /** WorkflowState connections */
            connections?: (synapse.workflow.IConnection[]|null);

            /** WorkflowState canvasScale */
            canvasScale?: (number|null);

            /** WorkflowState canvasOffsetX */
            canvasOffsetX?: (number|null);

            /** WorkflowState canvasOffsetY */
            canvasOffsetY?: (number|null);

            /** WorkflowState kanbanBoards */
            kanbanBoards?: (synapse.workflow.IKanbanBoard[]|null);

            /** WorkflowState aiNodes */
            aiNodes?: (synapse.workflow.IAINode[]|null);

            /** WorkflowState nodeConnectors */
            nodeConnectors?: (synapse.workflow.INodeConnector[]|null);

            /** WorkflowState metadata */
            metadata?: ({ [k: string]: string }|null);
        }

        /** Represents a WorkflowState. */
        class WorkflowState implements IWorkflowState {

            /**
             * Constructs a new WorkflowState.
             * @param [properties] Properties to set
             */
            constructor(properties?: synapse.workflow.IWorkflowState);

            /** WorkflowState id. */
            public id: string;

            /** WorkflowState name. */
            public name: string;

            /** WorkflowState notes. */
            public notes: synapse.workflow.INote[];

            /** WorkflowState connections. */
            public connections: synapse.workflow.IConnection[];

            /** WorkflowState canvasScale. */
            public canvasScale?: (number|null);

            /** WorkflowState canvasOffsetX. */
            public canvasOffsetX?: (number|null);

            /** WorkflowState canvasOffsetY. */
            public canvasOffsetY?: (number|null);

            /** WorkflowState kanbanBoards. */
            public kanbanBoards: synapse.workflow.IKanbanBoard[];

            /** WorkflowState aiNodes. */
            public aiNodes: synapse.workflow.IAINode[];

            /** WorkflowState nodeConnectors. */
            public nodeConnectors: synapse.workflow.INodeConnector[];

            /** WorkflowState metadata. */
            public metadata: { [k: string]: string };

            /** WorkflowState _canvasScale. */
            public _canvasScale?: "canvasScale";

            /** WorkflowState _canvasOffsetX. */
            public _canvasOffsetX?: "canvasOffsetX";

            /** WorkflowState _canvasOffsetY. */
            public _canvasOffsetY?: "canvasOffsetY";

            /**
             * Creates a new WorkflowState instance using the specified properties.
             * @param [properties] Properties to set
             * @returns WorkflowState instance
             */
            public static create(properties?: synapse.workflow.IWorkflowState): synapse.workflow.WorkflowState;

            /**
             * Encodes the specified WorkflowState message. Does not implicitly {@link synapse.workflow.WorkflowState.verify|verify} messages.
             * @param message WorkflowState message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: synapse.workflow.IWorkflowState, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified WorkflowState message, length delimited. Does not implicitly {@link synapse.workflow.WorkflowState.verify|verify} messages.
             * @param message WorkflowState message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: synapse.workflow.IWorkflowState, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a WorkflowState message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns WorkflowState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): synapse.workflow.WorkflowState;

            /**
             * Decodes a WorkflowState message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns WorkflowState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): synapse.workflow.WorkflowState;

            /**
             * Verifies a WorkflowState message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a WorkflowState message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns WorkflowState
             */
            public static fromObject(object: { [k: string]: any }): synapse.workflow.WorkflowState;

            /**
             * Creates a plain object from a WorkflowState message. Also converts values to other types if specified.
             * @param message WorkflowState
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: synapse.workflow.WorkflowState, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this WorkflowState to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for WorkflowState
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}
