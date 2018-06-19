import { createElement } from 'react';
import { Bem, Block, Elem, withMods } from '../src';
import { getModNode } from './helpers/node';

const always = (variant: boolean): () => boolean => () => variant;

describe('withMods:', () => {
    describe('Block:', () => {
        it('allows apply modifier as mixin', () => {
            interface IBProps {
                a?: boolean;
            }

            class MyBlock<P> extends Block<P & IBProps> {
                protected block = 'Block';

                protected tag(): string {
                    return this.props.a ? 'a' : 'i';
                }
            }

            interface IMProps {
                b?: string;
            }
            class BlockMod extends MyBlock<IMProps> {
                public static mod = (props: IMProps) => props.b === 'b';

                protected tag() {
                    return super.tag() + 'bbr';
                }
            }

            const B = withMods(MyBlock, BlockMod);

            expect(getModNode(createElement(B, {})).type()).toBe('i');
            expect(getModNode(createElement(B, { a: true })).type()).toBe('a');
            expect(getModNode(createElement(B, { a: true, b: 'b' })).type()).toBe('abbr');
        });

        it('allows to add modifiers for entity with modifiers', () => {
            class MyBlock extends Block {
                protected block = 'Block';
                protected tag() {
                    return 'a';
                }
            }
            class BlockMod extends MyBlock {
                public static mod = always(true);
                protected tag() {
                    return super.tag() + 'bbr';
                }
            }
            class BlockMod2 extends MyBlock {
                public static mod = always(true);
                protected attrs() {
                    return { id: 'the-id' };
                }
            }

            const B = withMods(MyBlock, BlockMod);
            const nodeB = createElement(B, {});
            expect(getModNode(nodeB).type()).toBe('abbr');
            expect(getModNode(nodeB).props()).not.toHaveProperty('id');

            const C = withMods(MyBlock, BlockMod, BlockMod2);
            const nodeC = createElement(C, {});
            expect(getModNode(nodeC).type()).toBe('abbr');
            expect(getModNode(nodeC).props()).toMatchObject({ id: 'the-id' });
        });

        it('allow to declare modifiers on redefinition levels', () => {
            interface IBProps {
                a?: boolean;
            }

            class MyBlock<P> extends Block<P & IBProps> {
                protected block = 'Block';

                protected tag() {
                    return 'a';
                }
            }

            interface IMProps {
                b?: string;
            }
            class BlockModCommon extends MyBlock<IMProps> {
                public static mod = always(true);

                protected tag() {
                    return super.tag() + 'bbr';
                }
            }

            class BlockModDesktop extends BlockModCommon {
                protected tag() {
                    return 'section';
                }
            }

            const B = withMods(MyBlock, BlockModDesktop);
            expect(getModNode(createElement(B, {})).type()).toBe('section');
        });

        it('complex methods in modifiers', () => {
            interface IBlockProps {
                c: string;
            }

            class MyBlock<P extends IBlockProps> extends Block<P> {
                public static defaultProps = {
                    c: 'c'
                };

                protected tag() {
                    return 'a';
                }
            }

            interface IMod1Props extends IBlockProps {
                a: string;
            }

            class BlockMod1 extends MyBlock<IMod1Props> {
                public static mod = always(true);

                public static defaultProps = {
                    ...MyBlock.defaultProps,
                    a: 'a'
                };

                protected tag() {
                    return super.tag() + 'bbr' + this.props.a;
                }
            }

            interface IMod2Props extends IBlockProps {
                b: string;
            }
            class BlockMod2 extends MyBlock<IMod2Props> {
                public static mod = always(true);

                public static defaultProps = {
                    ...MyBlock.defaultProps,
                    b: 'b'
                };

                protected tag() {
                    return super.tag() + 'section' + this.props.b;
                }
            }

            const A = withMods(MyBlock, BlockMod1);
            const B = withMods(MyBlock, BlockMod2);
            const C = withMods(MyBlock, BlockMod1, BlockMod2);

            expect(getModNode(createElement(A)).type()).toBe('abbra');
            expect(getModNode(createElement(B)).type()).toBe('asectionb');
            expect(getModNode(createElement(C)).type()).toBe('abbrasectionb');
        });
    });
});
