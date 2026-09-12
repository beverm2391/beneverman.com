import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { SlideFigure, SlideNotes, SlideRef } from "@/components/mdx/presentation-parts";

// Reference and figure numbers are assigned by walking the deck in setlist
// order (spine slide, then its dives) and numbering each source id and figure
// on first appearance. Authors keep stable ids — SlideRef `n` is an id into
// the deck's sources, a figure's identity is its src — and reordering slides
// can never desync a citation again. This runs at authoring time, before the
// tree crosses into the client Presentation, because the server flattens
// these components to host elements before the client could identify them.

type Numbering = {
  /** source id (SlideRef n / sources n) → display number, by first appearance */
  refs: Map<number, number>;
  /** figure src → display number, by first appearance */
  figs: Map<string, number>;
};

function renumberNode(node: ReactNode, numbering: Numbering): ReactNode {
  if (Array.isArray(node)) {
    return Children.map(node, (child) => renumberNode(child, numbering));
  }
  if (!isValidElement(node)) return node;

  const element = node as ReactElement<Record<string, unknown>>;
  const props: Record<string, unknown> = {};

  if (element.type === SlideRef) {
    const id = element.props.n as number;
    if (!numbering.refs.has(id)) numbering.refs.set(id, numbering.refs.size + 1);
    props.resolved = numbering.refs.get(id);
  } else if (element.type === SlideFigure && element.props.caption) {
    // Caption-less figures (the talk map) are illustrations, not numbered
    // figures; they must not consume a number invisibly.
    const src = element.props.src as string;
    if (!numbering.figs.has(src)) numbering.figs.set(src, numbering.figs.size + 1);
    props.figNumber = numbering.figs.get(src);
  } else if (element.type === SlideNotes) {
    // The references slide reorders itself once every ref has a number, so it
    // receives the map after the walk instead of a value computed here.
    props.order = numbering.refs;
  }

  // Refs live in normal children; PresentationSlide's `notes` prop is the one
  // other slot that can carry marked-up content.
  if (element.props.children !== undefined) {
    props.children = renumberNode(element.props.children as ReactNode, numbering);
  }
  if (isValidElement(element.props.notes)) {
    props.notes = renumberNode(element.props.notes as ReactNode, numbering);
  }

  return Object.keys(props).length > 0 ? cloneElement(element, props) : element;
}

/**
 * Walk the deck's columns in presentation order and resolve every reference
 * and figure number by first appearance. Benched slides never enter, so they
 * never consume a number; sources no live slide cites simply sort last on the
 * references slide.
 */
export function numberPresentation(columns: ReactElement[][]): ReactElement[][] {
  const numbering: Numbering = { figs: new Map(), refs: new Map() };
  return columns.map((stack) => stack.map((slide) => renumberNode(slide, numbering) as ReactElement));
}
