import type {
  ComponentType,
  ForwardRefExoticComponent,
  InputHTMLAttributes,
  MouseEvent,
  ReactNode,
  RefAttributes,
} from 'react';

/**
 * Generic data-attribute passthrough. Allows package components to anchor
 * tour libraries (`data-tour="..."`) or analytics hooks (`data-testid="..."`)
 * onto any primitive. Real shadcn primitives spread `...props` to the
 * underlying DOM element anyway — this just admits that into the type system.
 */
type DataAttrs = Record<`data-${string}`, string | undefined>;

/**
 * The full set of shadcn-style UI primitives the package components consume.
 *
 * Consumers (portal + website) supply their own primitive implementations
 * — the package only cares that the prop shape matches. Variants only list
 * values the package actually uses; widening the union in consumer types is
 * fine and forward-compatible.
 *
 * IMPORTANT: `Input` MUST forwardRef to the underlying <input>. The package's
 * `ProblemDisplay` uses `inputRef.current.focus()` on mobile to trigger the
 * soft keyboard. A consumer Input that doesn't forwardRef will silently
 * break focus-on-mount.
 */
export interface UIPrimitiveBag {
  // ── Layout / structure ─────────────────────────────────────────────
  Card: ComponentType<{ className?: string; children?: ReactNode }>;
  CardContent: ComponentType<{ className?: string; children?: ReactNode }>;
  CardHeader: ComponentType<{ className?: string; children?: ReactNode }>;
  CardTitle: ComponentType<{ className?: string; children?: ReactNode } & DataAttrs>;
  CardDescription: ComponentType<{ className?: string; children?: ReactNode }>;

  // ── Controls ───────────────────────────────────────────────────────
  Button: ComponentType<{
    className?: string;
    variant?: 'default' | 'secondary' | 'ghost' | 'outline' | 'destructive';
    size?: 'sm' | 'default' | 'lg' | 'icon';
    disabled?: boolean;
    onClick?: (e: MouseEvent) => void;
    type?: 'button' | 'submit' | 'reset';
    children?: ReactNode;
  } & DataAttrs>;
  Input: ForwardRefExoticComponent<
    InputHTMLAttributes<HTMLInputElement> & RefAttributes<HTMLInputElement>
  >;
  Switch: ComponentType<{
    id?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  } & DataAttrs>;
  Label: ComponentType<{ htmlFor?: string; className?: string; children?: ReactNode }>;
  Progress: ComponentType<{ value: number; className?: string }>;

  // ── Feedback / surface ─────────────────────────────────────────────
  Badge: ComponentType<{
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
    className?: string;
    children?: ReactNode;
  } & DataAttrs>;
  Alert: ComponentType<{
    variant?: 'default' | 'destructive';
    className?: string;
    children?: ReactNode;
  }>;
  AlertDescription: ComponentType<{ className?: string; children?: ReactNode }>;
  AlertTitle: ComponentType<{ className?: string; children?: ReactNode }>;

  // ── Modal ──────────────────────────────────────────────────────────
  Dialog: ComponentType<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: ReactNode;
  }>;
  DialogContent: ComponentType<{ className?: string; children?: ReactNode } & DataAttrs>;
  DialogHeader: ComponentType<{ className?: string; children?: ReactNode }>;
  DialogTitle: ComponentType<{ className?: string; children?: ReactNode }>;
  DialogDescription: ComponentType<{ className?: string; children?: ReactNode }>;
  DialogFooter: ComponentType<{ className?: string; children?: ReactNode }>;

  // ── Select ─────────────────────────────────────────────────────────
  Select: ComponentType<{
    value?: string;
    onValueChange?: (v: string) => void;
    disabled?: boolean;
    children?: ReactNode;
  }>;
  SelectContent: ComponentType<{ children?: ReactNode }>;
  SelectItem: ComponentType<{ value: string; children?: ReactNode }>;
  SelectTrigger: ComponentType<{ id?: string; className?: string; children?: ReactNode } & DataAttrs>;
  SelectValue: ComponentType<{ placeholder?: string }>;

  // ── Tabs ───────────────────────────────────────────────────────────
  Tabs: ComponentType<{
    value?: string;
    onValueChange?: (v: string) => void;
    defaultValue?: string;
    className?: string;
    children?: ReactNode;
  } & DataAttrs>;
  TabsContent: ComponentType<{ value: string; className?: string; children?: ReactNode }>;
  TabsList: ComponentType<{ className?: string; children?: ReactNode }>;
  TabsTrigger: ComponentType<{ value: string; className?: string; children?: ReactNode } & DataAttrs>;

  // ── Accordion (study-guide; supports type="single" AND type="multiple") ─
  Accordion: ComponentType<{
    type: 'single' | 'multiple';
    collapsible?: boolean;
    defaultValue?: string | string[];
    value?: string | string[];
    className?: string;
    children?: ReactNode;
  }>;
  AccordionItem: ComponentType<{ value: string; className?: string; children?: ReactNode }>;
  AccordionTrigger: ComponentType<{ className?: string; children?: ReactNode }>;
  AccordionContent: ComponentType<{ className?: string; children?: ReactNode }>;

  // ── Table (study-guide Scaling + Memorize/Crafty bodies) ───────────
  Table: ComponentType<{ className?: string; children?: ReactNode }>;
  TableBody: ComponentType<{ className?: string; children?: ReactNode }>;
  TableHead: ComponentType<{ className?: string; children?: ReactNode }>;
  TableHeader: ComponentType<{ className?: string; children?: ReactNode }>;
  TableRow: ComponentType<{ className?: string; children?: ReactNode }>;
  TableCell: ComponentType<{ className?: string; children?: ReactNode }>;
}
