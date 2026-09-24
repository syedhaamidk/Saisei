/* Type-level usage test — checked by `npm run test:types` (tsc --noEmit).
   Not executed; proves the .d.ts matches real usage. */
import * as React from "react";
import {
  Button, Card, Badge, Alert, Skeleton, Empty, Progress, Crumbs,
  Modal, Tabs, Accordion, ToastProvider, useToast,
  TickerTape, ThemeToggle, DataTable, CommandPalette,
  Dropdown, Combobox, Reveal, AnimatedNumber,
} from "../react/index";

export function All() {
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  return (
    <ToastProvider>
      <Button variant="primary" size="sm" onClick={() => toast("hi")}>Go</Button>
      <Card tag="// T" title="T" corners enter><Badge tone="accent">A</Badge></Card>
      <Alert tone="warning" tag="F">msg</Alert>
      <Skeleton width={120} height={12} />
      <Empty title="Nothing" action={<Button variant="secondary">Add</Button>}>empty</Empty>
      <Progress value={65} label="Up" />
      <Crumbs trail={[{ label: "A", href: "#a" }, { label: "B" }]} />
      <Modal open={open} onClose={() => setOpen(false)} footer={null}>body</Modal>
      <Tabs tabs={[{ id: "a", label: "A", content: "x" }]} onChange={(id: string) => setOpen(id === "a")} />
      <Accordion items={[{ id: "a", title: "T", content: "C" }]} allowMultiple />
      <TickerTape items={[{ symbol: "A", price: "1", change: "+1%", up: true }]} />
      <ThemeToggle className="x" />
      <DataTable columns={[{ key: "n", label: "N", render: (v) => <b>{String(v)}</b> }]} rows={[{ n: "x" }]} pageSize={3} />
      <CommandPalette open={open} onOpenChange={setOpen} items={[{ label: "Go", hint: "run", run: () => setOpen(false) }]} />
      <Dropdown label="Acts" items={[{ label: "One", hint: "1", onSelect: () => setOpen(true) }, { label: "", sep: true }]} align="right" />
      <Combobox label="Team" options={["A", { value: "b", label: "B" }]} onPick={(v: string) => toast(v)} />
      <Reveal delay={120}>
        <Card tag="// MOTION" title="Revealed on scroll">Staggered entrance, same rise as the kit.</Card>
      </Reveal>
      <p className="mono text-sm">
        Shipped <AnimatedNumber value={128} /> components and counting.
      </p>
    </ToastProvider>
  );
}
