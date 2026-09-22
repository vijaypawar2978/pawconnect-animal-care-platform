import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  Activity, AlertTriangle, ArrowRight, CalendarDays, Check, CircleHelp,
  ClipboardList, HeartPulse, LocateFixed, MapPin, Menu, PawPrint, Plus, Search,
  ShieldCheck, Siren, Stethoscope, Syringe, X, Users, MessageCircle, FileSearch,
} from 'lucide-react';
import {
  getGetAnimalQueryKey, getGetDashboardQueryKey, getListAnimalsQueryKey,
  getListEmergenciesQueryKey, getListReportsQueryKey, getListVetsQueryKey,
  useAskAssistant, useCreateAnimal, useCreateAppointment, useCreateEmergency,
  useCreateReport, useGetAnimal, useGetDashboard, useListAnimals, useListEmergencies,
  useListReports, useListVets, useUpdateAnimal,
} from '@workspace/api-client-react';
import type { Animal, AnimalInput, Emergency, EmergencyInput, Report, ReportInput, Vet } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';

const queryClient = new QueryClient();

const navItems = [
  { href: '/', label: 'Care pulse', icon: Activity },
  { href: '/adoption', label: 'Find a home', icon: HeartPulse },
  { href: '/emergency', label: 'Emergency SOS', icon: Siren, urgent: true },
  { href: '/lost-found', label: 'Lost & found', icon: FileSearch },
  { href: '/vets', label: 'Vet network', icon: Stethoscope },
  { href: '/assistant', label: 'Care assistant', icon: MessageCircle },
  { href: '/animals', label: 'Animal profiles', icon: PawPrint },
];

function cn(...values: Array<string | false | undefined>) { return values.filter(Boolean).join(' '); }

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="noise min-h-[100dvh] bg-background text-foreground">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-sidebar px-4 py-5 text-sidebar-foreground transition-transform md:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="flex items-center gap-3 px-3 pb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-orange-950/10">
            <PawPrint size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display text-xl font-bold tracking-tight">PawConnect</div>
            <div className="text-[10px] uppercase tracking-[.2em] text-sidebar-foreground/55">Care, together</div>
          </div>
        </div>
        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-sidebar-foreground/40">Your neighborhood desk</div>
        <nav className="space-y-1" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}
                className={cn('group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium',
                  active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground')}>
                <Icon size={18} className={cn(item.urgent && !active && 'text-sidebar-primary')} />
                <span>{item.label}</span>
                {item.urgent && <span className="ml-auto h-2 w-2 rounded-full bg-sidebar-primary" />}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sidebar-primary"><ShieldCheck size={16} /><span className="text-xs font-bold">Community protocol</span></div>
          <p className="text-xs leading-relaxed text-sidebar-foreground/60">SOS requests are shared with nearby responders and care partners.</p>
        </div>
      </aside>
      {mobileOpen && <button aria-label="Close menu" data-testid="button-close-menu" className="fixed inset-0 z-30 bg-foreground/30 md:hidden" onClick={() => setMobileOpen(false)} />}
      <main className="min-h-[100dvh] md:pl-[260px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-border/70 bg-background/85 px-5 backdrop-blur-xl md:px-10">
          <button className="rounded-lg p-2 hover:bg-muted md:hidden" aria-label="Open menu" data-testid="button-open-menu" onClick={() => setMobileOpen(true)}><Menu size={21} /></button>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><LocateFixed size={14} className="text-primary" /> <span>Field desk</span><span className="text-border">/</span><span className="font-medium text-foreground">{navItems.find((item) => item.href === location)?.label ?? 'Care pulse'}</span></div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground lg:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Network live</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-accent-foreground" data-testid="avatar-coordinator">MC</div>
          </div>
        </header>
        <div className="mx-auto max-w-[1500px] px-5 py-7 md:px-10 md:py-10">{children}</div>
      </main>
    </div>
  );
}

function PageHeading({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
    <div><div className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-primary">{eyebrow}</div><h1 className="font-display text-4xl font-bold tracking-[-.04em] text-balance md:text-5xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{detail}</p></div>
    {action}
  </div>;
}

function Button({ children, onClick, type = 'button', variant = 'primary', disabled, testId }: { children: ReactNode; onClick?: () => void; type?: 'button' | 'submit'; variant?: 'primary' | 'soft' | 'outline' | 'danger'; disabled?: boolean; testId?: string }) {
  return <button type={type} onClick={onClick} disabled={disabled} data-testid={testId}
    className={cn('inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50',
      variant === 'primary' && 'bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:-translate-y-0.5 hover:bg-primary/90',
      variant === 'soft' && 'bg-secondary text-secondary-foreground hover:bg-secondary/70',
      variant === 'outline' && 'border border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted',
      variant === 'danger' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90')}>
    {children}
  </button>;
}

function StateMessage({ type, text, onRetry }: { type: 'loading' | 'error' | 'empty'; text: string; onRetry?: () => void }) {
  if (type === 'loading') return <div className="grid gap-4 md:grid-cols-2"><div className="skeleton h-44 rounded-2xl" /><div className="skeleton h-44 rounded-2xl" /></div>;
  return <div className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 text-center"><div className={cn('mb-3 flex h-11 w-11 items-center justify-center rounded-full', type === 'error' ? 'bg-red-100 text-red-600' : 'bg-secondary text-secondary-foreground')}>{type === 'error' ? <AlertTriangle size={20} /> : <PawPrint size={20} />}</div><p className="text-sm font-semibold">{text}</p>{type === 'error' && onRetry && <Button onClick={onRetry} variant="outline" testId="button-retry">Try again</Button>}</div>;
}

function StatCard({ label, value, detail, icon: Icon, tone = 'default' }: { label: string; value: number | string; detail: string; icon: typeof Activity; tone?: 'default' | 'alert' | 'mint' }) {
  return <div className={cn('rounded-2xl border p-5 shadow-sm', tone === 'alert' ? 'border-primary/25 bg-primary/10' : tone === 'mint' ? 'border-accent/60 bg-accent/25' : 'border-card-border bg-card')}>
    <div className="mb-5 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">{label}</span><div className={cn('rounded-xl p-2.5', tone === 'alert' ? 'bg-primary/15 text-primary' : tone === 'mint' ? 'bg-card text-chart-2' : 'bg-muted text-foreground')}><Icon size={18} /></div></div>
    <div className="font-display text-4xl font-bold tracking-[-.04em]" data-testid={`stat-${label.toLowerCase().replaceAll(' ', '-')}`}>{value}</div><div className="mt-2 text-xs text-muted-foreground">{detail}</div>
  </div>;
}

function Home() {
  const dashboard = useGetDashboard();
  const emergencies = useListEmergencies();
  const data = dashboard.data;
  const today = new Intl.DateTimeFormat('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  return <Shell><PageHeading eyebrow={today} title="Good morning, Maya." detail="Here is the live care pulse for your neighborhood. A little attention in the right place can change an animal’s whole day." action={<Link href="/emergency" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 hover:-translate-y-0.5" data-testid="link-start-sos"><Siren size={17} /> Start an SOS</Link>} />
    {dashboard.isLoading ? <StateMessage type="loading" text="" /> : dashboard.isError ? <StateMessage type="error" text="The care pulse is taking a breather." onRetry={() => dashboard.refetch()} /> :
      <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active emergencies" value={data?.activeEmergencies ?? 0} detail="Needs a responder now" icon={Siren} tone="alert" />
        <StatCard label="Looking for homes" value={data?.animalsForAdoption ?? 0} detail="Profiles ready to meet" icon={HeartPulse} />
        <StatCard label="Nearby vets" value={data?.nearbyVets ?? 0} detail="Open in your area" icon={Stethoscope} tone="mint" />
        <StatCard label="Open reports" value={data?.openReports ?? 0} detail="Lost & found cases" icon={FileSearch} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <section className="rounded-2xl border border-card-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-chart-2"><span className="h-2 w-2 animate-pulse rounded-full bg-chart-2" /> Live board</div><h2 className="mt-2 font-display text-2xl font-bold">What needs you today</h2></div><Link href="/lost-found" className="text-xs font-bold text-primary hover:underline" data-testid="link-view-board">View all activity <ArrowRight size={14} className="ml-1 inline" /></Link></div>
          <div className="space-y-1">
            {(data?.recentActivity ?? []).length === 0 ? <StateMessage type="empty" text="No recent activity yet. Check back as your community gets moving." /> : data?.recentActivity.map((activity) => <div key={activity.id} className="flex gap-4 rounded-xl p-3 hover:bg-muted/60" data-testid={`activity-${activity.id}`}><div className={cn('mt-1 h-2.5 w-2.5 shrink-0 rounded-full', activity.kind === 'emergency' ? 'bg-primary' : 'bg-chart-2')} /><div className="min-w-0 flex-1"><div className="flex justify-between gap-4"><p className="text-sm font-bold">{activity.title}</p><span className="shrink-0 text-xs text-muted-foreground">{activity.time}</span></div><p className="mt-1 text-sm text-muted-foreground">{activity.detail}</p></div></div>)}
          </div>
        </section>
        <section className="overflow-hidden rounded-2xl border border-card-border bg-sidebar p-6 text-sidebar-foreground shadow-sm">
          <div className="mb-6 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[.15em] text-sidebar-primary">Responder view</span><Activity size={18} className="text-sidebar-primary" /></div>
          <h2 className="font-display text-3xl font-bold leading-tight">Small actions.<br />Real outcomes.</h2><p className="mt-4 text-sm leading-6 text-sidebar-foreground/60">Coordinate a transport, open a profile, or simply share a report. The network is strongest when we keep the details moving.</p>
          <div className="mt-7 space-y-2"><Link href="/adoption" className="flex items-center justify-between rounded-xl bg-sidebar-accent px-4 py-3 text-sm font-bold hover:bg-sidebar-accent/80" data-testid="link-browse-adoption">Browse animals <ArrowRight size={16} /></Link><Link href="/vets" className="flex items-center justify-between rounded-xl border border-sidebar-border px-4 py-3 text-sm font-bold hover:bg-sidebar-accent" data-testid="link-find-vet">Find a vet <ArrowRight size={16} /></Link></div>
        </section>
      </div></>}
  </Shell>;
}

function AnimalCard({ animal, onSelect }: { animal: Animal; onSelect?: () => void }) {
  return <article className="group overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg" data-testid={`card-animal-${animal.id}`}>
    <button onClick={onSelect} className="block w-full text-left" data-testid={`button-view-animal-${animal.id}`}>
      <div className="relative h-52 overflow-hidden bg-secondary">{animal.imageUrl ? <img src={animal.imageUrl} alt={`${animal.name}, ${animal.breed}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center bg-accent/35 font-display text-5xl font-bold text-accent-foreground">{animal.name.slice(0, 1)}</div>}<span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-foreground backdrop-blur">{animal.status}</span></div>
      <div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-xl font-bold">{animal.name}</h3><p className="mt-1 text-xs text-muted-foreground">{animal.breed} · {animal.age}</p></div><span className="rounded-full bg-muted p-2 text-primary"><PawPrint size={15} /></span></div><div className="mt-5 flex items-center justify-between text-xs text-muted-foreground"><span className="flex items-center gap-1"><MapPin size={13} /> {animal.location}</span><span className="font-bold text-primary">Meet {animal.name} <ArrowRight size={13} className="ml-1 inline" /></span></div></div>
    </button>
  </article>;
}

function Adoption() {
  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState('');
  const params = useMemo(() => ({ search: search || undefined, species: species || undefined, status: 'available' }), [search, species]);
  const animals = useListAnimals(params);
  return <Shell><PageHeading eyebrow="Adoption desk" title="Meet your next good friend." detail="Every profile here is a real invitation to care. Filter by what fits your home, then start a conversation with the people who know them best." action={<Link href="/animals" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold hover:border-primary/50" data-testid="link-manage-profiles"><ClipboardList size={17} /> Manage profiles</Link>} />
    <div className="mb-7 flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-3 shadow-sm sm:flex-row"><div className="relative flex-1"><Search size={17} className="absolute left-4 top-3.5 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, breed, or neighborhood" className="w-full rounded-xl border-0 bg-muted py-3 pl-11 pr-4 text-sm outline-none ring-0" data-testid="input-adoption-search" /></div><select value={species} onChange={(e) => setSpecies(e.target.value)} className="rounded-xl border-0 bg-muted px-4 py-3 text-sm font-semibold outline-none" data-testid="select-adoption-species"><option value="">All species</option><option value="dog">Dogs</option><option value="cat">Cats</option><option value="rabbit">Rabbits</option></select></div>
    {animals.isLoading ? <StateMessage type="loading" text="" /> : animals.isError ? <StateMessage type="error" text="We couldn't load adoption profiles." onRetry={() => animals.refetch()} /> : !animals.data?.length ? <StateMessage type="empty" text="No animals match those filters. Try widening the search." /> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{animals.data.map((animal) => <AnimalCard key={animal.id} animal={animal} />)}</div>}
  </Shell>;
}

function Emergency() {
  const queryClient = useQueryClient();
  const emergencies = useListEmergencies();
  const create = useCreateEmergency();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EmergencyInput>({ title: '', description: '', location: '', urgency: 'high' });
  const submit = (e: FormEvent) => { e.preventDefault(); create.mutate({ data: form }, { onSuccess: () => { setForm({ title: '', description: '', location: '', urgency: 'high' }); setOpen(false); queryClient.invalidateQueries({ queryKey: getListEmergenciesQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); } }); };
  return <Shell><PageHeading eyebrow="Rapid response" title="Emergency SOS" detail="Create a clear, location-first request so nearby people can act quickly. If an animal is in immediate danger, contact local emergency services too." action={<Button onClick={() => setOpen((v) => !v)} variant="danger" testId="button-new-emergency"><Plus size={17} /> New SOS</Button>} />
    {open && <form onSubmit={submit} className="mb-7 rounded-2xl border border-primary/30 bg-primary/10 p-5 md:p-7" data-testid="form-emergency"><div className="mb-5 flex items-start justify-between"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-destructive"><Siren size={15} /> Priority intake</div><h2 className="mt-2 font-display text-2xl font-bold">Tell the network what happened</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Close form" data-testid="button-close-emergency"><X size={18} /></button></div><div className="grid gap-4 md:grid-cols-2"><Field label="Short title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Injured dog near the bridge" testId="input-emergency-title" /><Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="Street, landmark, or pin" testId="input-emergency-location" /><label className="text-sm font-bold md:col-span-2">What does the responder need to know?<textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm font-normal outline-none focus:border-primary" placeholder="Condition, immediate risks, and what help is needed" data-testid="textarea-emergency-description" /></label><label className="text-sm font-bold">Urgency<select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })} className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm font-normal outline-none" data-testid="select-emergency-urgency"><option value="critical">Critical · life at risk</option><option value="high">High · needs help soon</option><option value="moderate">Moderate · coordinate care</option></select></label></div><div className="mt-5 flex flex-wrap items-center gap-3"><Button type="submit" disabled={create.isPending} testId="button-submit-emergency">{create.isPending ? 'Sending request…' : 'Send SOS request'} <ArrowRight size={16} /></Button><span className="text-xs text-muted-foreground">Your location will be visible to trusted responders.</span></div>{create.isError && <p className="mt-3 text-sm font-semibold text-destructive">Could not send the request. Please try again.</p>}</form>}
    <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm md:p-7"><div className="mb-6 flex items-center justify-between"><div><h2 className="font-display text-2xl font-bold">Response board</h2><p className="mt-1 text-sm text-muted-foreground">Requests closest to needing a helping hand.</p></div><span className="flex items-center gap-2 text-xs font-bold text-chart-2"><span className="h-2 w-2 animate-pulse rounded-full bg-chart-2" /> Updating live</span></div>{emergencies.isLoading ? <StateMessage type="loading" text="" /> : emergencies.isError ? <StateMessage type="error" text="Response board unavailable right now." onRetry={() => emergencies.refetch()} /> : !emergencies.data?.length ? <StateMessage type="empty" text="No active SOS requests. That is good news." /> : <div className="space-y-3">{emergencies.data.map((item) => <EmergencyRow key={item.id} emergency={item} />)}</div>}</section>
  </Shell>;
}

function EmergencyRow({ emergency }: { emergency: Emergency }) {
  const urgent = emergency.urgency.toLowerCase().includes('critical') || emergency.urgency.toLowerCase().includes('high');
  return <div className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center" data-testid={`row-emergency-${emergency.id}`}><div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', urgent ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')}><Siren size={19} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{emergency.title}</h3><span className={cn('rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider', urgent ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')}>{emergency.urgency}</span></div><p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{emergency.description}</p><div className="mt-2 flex gap-3 text-xs text-muted-foreground"><span><MapPin size={12} className="mr-1 inline" />{emergency.location}</span><span>{emergency.status}</span></div></div><span className="flex items-center gap-1 text-xs font-bold text-primary">Tracking <ArrowRight size={14} /></span></div>;
}

function LostFound() {
  const queryClient = useQueryClient();
  const [type, setType] = useState('');
  const reports = useListReports({ type: type || undefined });
  const create = useCreateReport();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ReportInput>({ type: 'lost', name: '', location: '', date: '', description: '', imageUrl: '' });
  const submit = (e: FormEvent) => { e.preventDefault(); create.mutate({ data: form }, { onSuccess: () => { setOpen(false); setForm({ type: 'lost', name: '', location: '', date: '', description: '', imageUrl: '' }); queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); } }); };
  return <Shell><PageHeading eyebrow="Community search" title="Bring them home." detail="A useful report has a clear date, a precise place, and the small details someone else might recognize. Add one when you can." action={<Button onClick={() => setOpen((v) => !v)} testId="button-new-report"><Plus size={17} /> Create report</Button>} />
    <div className="mb-6 flex gap-2"><button className={cn('rounded-full px-4 py-2 text-xs font-bold', !type ? 'bg-sidebar text-sidebar-foreground' : 'bg-card border border-border text-muted-foreground')} onClick={() => setType('')} data-testid="button-filter-all-reports">All reports</button><button className={cn('rounded-full px-4 py-2 text-xs font-bold', type === 'lost' ? 'bg-sidebar text-sidebar-foreground' : 'bg-card border border-border text-muted-foreground')} onClick={() => setType('lost')} data-testid="button-filter-lost">Lost</button><button className={cn('rounded-full px-4 py-2 text-xs font-bold', type === 'found' ? 'bg-sidebar text-sidebar-foreground' : 'bg-card border border-border text-muted-foreground')} onClick={() => setType('found')} data-testid="button-filter-found">Found</button></div>
    {open && <form onSubmit={submit} className="mb-7 rounded-2xl border border-card-border bg-card p-5 shadow-sm md:p-7" data-testid="form-report"><div className="mb-5 flex items-center justify-between"><h2 className="font-display text-2xl font-bold">Create a lost & found report</h2><button type="button" onClick={() => setOpen(false)} data-testid="button-close-report"><X size={18} /></button></div><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-bold">Report type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-normal" data-testid="select-report-type"><option value="lost">Lost animal</option><option value="found">Found animal</option></select></label><Field label="Animal name or description" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Name, color, distinguishing marks" testId="input-report-name" /><Field label="Last seen / found location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="Neighborhood or landmark" testId="input-report-location" /><label className="text-sm font-bold">Date<input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-normal" data-testid="input-report-date" /></label><label className="text-sm font-bold md:col-span-2">Details<textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-normal" placeholder="Collar, temperament, contact-safe details" data-testid="textarea-report-description" /></label><Field label="Photo URL (optional)" value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} placeholder="https://…" testId="input-report-image" /></div><div className="mt-5"><Button type="submit" disabled={create.isPending} testId="button-submit-report">{create.isPending ? 'Publishing…' : 'Publish report'} <ArrowRight size={16} /></Button></div></form>}
    {reports.isLoading ? <StateMessage type="loading" text="" /> : reports.isError ? <StateMessage type="error" text="Reports are unavailable right now." onRetry={() => reports.refetch()} /> : !reports.data?.length ? <StateMessage type="empty" text="No reports in this view yet." /> : <div className="grid gap-4 lg:grid-cols-2">{reports.data.map((report) => <ReportCard key={report.id} report={report} />)}</div>}
  </Shell>;
}

function ReportCard({ report }: { report: Report }) {
  return <article className="flex gap-4 rounded-2xl border border-card-border bg-card p-4 shadow-sm" data-testid={`card-report-${report.id}`}><div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">{report.imageUrl ? <img src={report.imageUrl} alt={report.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center font-display text-3xl font-bold text-secondary-foreground">{report.name.slice(0, 1)}</div>}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><span className={cn('rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider', report.type === 'lost' ? 'bg-primary/15 text-primary' : 'bg-accent/50 text-chart-2')}>{report.type}</span><span className="text-xs text-muted-foreground">{report.status}</span></div><h3 className="mt-3 font-display text-xl font-bold">{report.name}</h3><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{report.description}</p><div className="mt-3 text-xs text-muted-foreground"><MapPin size={12} className="mr-1 inline" />{report.location} · {report.date}</div></div></article>;
}

function Vets() {
  const queryClient = useQueryClient();
  const vets = useListVets();
  const create = useCreateAppointment();
  const [selected, setSelected] = useState<Vet | null>(null);
  const [form, setForm] = useState({ animalName: '', date: '', time: '', reason: '' });
  const submit = (e: FormEvent) => { e.preventDefault(); if (!selected) return; create.mutate({ data: { ...form, vetId: selected.id } }, { onSuccess: () => { setSelected(null); setForm({ animalName: '', date: '', time: '', reason: '' }); queryClient.invalidateQueries({ queryKey: getListVetsQueryKey() }); } }); };
  return <Shell><PageHeading eyebrow="Care network" title="The right care, nearby." detail="Browse trusted veterinary partners, see who can help today, and request a time that works for you and your animal." /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{vets.isLoading ? <StateMessage type="loading" text="" /> : vets.isError ? <StateMessage type="error" text="Vet network unavailable right now." onRetry={() => vets.refetch()} /> : !vets.data?.length ? <div className="md:col-span-2 xl:col-span-3"><StateMessage type="empty" text="No nearby vets are listed yet." /></div> : vets.data.map((vet) => <VetCard key={vet.id} vet={vet} onBook={() => setSelected(vet)} />)}</div>
    {selected && <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/35 p-0 sm:items-center sm:p-5"><form onSubmit={submit} className="w-full max-w-lg rounded-t-3xl bg-card p-6 shadow-2xl sm:rounded-3xl" data-testid="form-appointment"><div className="mb-6 flex items-start justify-between"><div><div className="text-xs font-bold uppercase tracking-[.15em] text-primary">Appointment request</div><h2 className="mt-2 font-display text-2xl font-bold">{selected.name}</h2><p className="mt-1 text-sm text-muted-foreground">{selected.clinic} · {selected.distance}</p></div><button type="button" onClick={() => setSelected(null)} data-testid="button-close-appointment"><X size={18} /></button></div><div className="space-y-4"><Field label="Animal name" value={form.animalName} onChange={(v) => setForm({ ...form, animalName: v })} placeholder="Which animal needs care?" testId="input-appointment-animal" /><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Preferred date<input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-normal" data-testid="input-appointment-date" /></label><label className="text-sm font-bold">Preferred time<input required type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-normal" data-testid="input-appointment-time" /></label></div><label className="text-sm font-bold">Reason for visit<textarea required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-normal" placeholder="Routine check-up, symptoms, vaccination…" data-testid="textarea-appointment-reason" /></label></div><Button type="submit" disabled={create.isPending} testId="button-submit-appointment" >{create.isPending ? 'Requesting…' : 'Request appointment'} <CalendarDays size={16} /></Button>{create.isError && <p className="mt-3 text-sm text-destructive">We couldn't request that appointment.</p>}</form></div>}
  </Shell>;
}

function VetCard({ vet, onBook }: { vet: Vet; onBook: () => void }) {
  return <article className="rounded-2xl border border-card-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md" data-testid={`card-vet-${vet.id}`}><div className="mb-5 flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/45 text-chart-2"><Stethoscope size={22} /></div><span className={cn('rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider', vet.availableToday ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground')}>{vet.availableToday ? 'Open today' : 'Next opening soon'}</span></div><h3 className="font-display text-xl font-bold">{vet.name}</h3><p className="mt-1 text-sm text-muted-foreground">{vet.clinic}</p><div className="my-5 flex items-center gap-4 text-xs text-muted-foreground"><span><MapPin size={13} className="mr-1 inline" />{vet.distance}</span><span className="font-bold text-foreground">★ {vet.rating}</span></div><div className="mb-5 rounded-xl bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">{vet.specialty}</div><Button onClick={onBook} variant="outline" testId={`button-book-vet-${vet.id}`}><CalendarDays size={16} /> Book a visit</Button></article>;
}

function Assistant() {
  const ask = useAskAssistant();
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<{ urgency: string; guidance: string; nextSteps: string[]; disclaimer: string } | null>(null);
  const submit = (e: FormEvent) => { e.preventDefault(); if (!message.trim()) return; ask.mutate({ data: { message } }, { onSuccess: (data) => setResponse(data) }); };
  return <Shell><PageHeading eyebrow="First-line guidance" title="Ask before you panic." detail="A calm first step for everyday animal-care questions. Share what you’re seeing and get practical next steps, with clear boundaries about when to call a professional." /><div className="grid gap-6 xl:grid-cols-[1fr_.7fr]"><section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm md:p-7"><div className="mb-7 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary"><MessageCircle size={22} /></div><div><h2 className="font-display text-2xl font-bold">What is happening?</h2><p className="text-sm text-muted-foreground">Include species, age, symptoms, and how long it has been happening.</p></div></div><form onSubmit={submit}><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={7} placeholder="For example: My 4-year-old cat has been hiding and skipped dinner…" className="w-full resize-none rounded-2xl border border-input bg-background p-4 text-sm leading-6 outline-none focus:border-primary" data-testid="textarea-assistant-message" /><div className="mt-4 flex items-center justify-between gap-4"><span className="text-xs text-muted-foreground">This is educational guidance, not a diagnosis.</span><Button type="submit" disabled={ask.isPending || !message.trim()} testId="button-ask-assistant">{ask.isPending ? 'Thinking…' : 'Get guidance'} <ArrowRight size={16} /></Button></div></form>{ask.isError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">The assistant could not respond. Please try again or contact a vet directly.</p>}{response && <div className="mt-7 border-t border-border pt-6" data-testid="assistant-response"><div className="mb-4 flex items-center justify-between"><h3 className="font-display text-xl font-bold">Your care note</h3><span className={cn('rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider', response.urgency.toLowerCase().includes('urgent') ? 'bg-primary/15 text-primary' : 'bg-accent/50 text-chart-2')}>{response.urgency}</span></div><p className="text-sm leading-7">{response.guidance}</p><div className="mt-5 rounded-xl bg-muted p-4"><div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Next steps</div><ul className="space-y-2">{response.nextSteps.map((step, index) => <li key={index} className="flex gap-2 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-chart-2" />{step}</li>)}</ul></div><p className="mt-4 text-xs leading-5 text-muted-foreground"><ShieldCheck size={13} className="mr-1 inline" />{response.disclaimer}</p></div>}</section><aside className="rounded-2xl border border-primary/20 bg-primary/10 p-6"><div className="mb-4 flex items-center gap-2 text-primary"><CircleHelp size={18} /><span className="text-xs font-bold uppercase tracking-[.15em]">Safety first</span></div><h2 className="font-display text-2xl font-bold">Know when to escalate.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">If there is difficulty breathing, uncontrolled bleeding, collapse, poisoning, severe pain, or a road injury, skip the chat and contact an emergency vet immediately.</p><Link href="/emergency" className="mt-6 inline-flex items-center gap-2 font-bold text-primary hover:underline" data-testid="link-assistant-emergency">Open Emergency SOS <ArrowRight size={15} /></Link></aside></div></Shell>;
}

function Animals() {
  const queryClient = useQueryClient();
  const animals = useListAnimals();
  const create = useCreateAnimal();
  const update = useUpdateAnimal();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const detail = useGetAnimal(selectedId ?? 0, { query: { enabled: selectedId !== null, queryKey: getGetAnimalQueryKey(selectedId ?? 0) } });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AnimalInput>({ name: '', species: 'dog', breed: '', age: '', location: '', status: 'available', imageUrl: '', description: '', vaccinated: false });
  const submit = (e: FormEvent) => { e.preventDefault(); if (selectedId) { update.mutate({ id: selectedId, data: { name: form.name, description: form.description, vaccinated: form.vaccinated, status: form.status } }, { onSuccess: () => { setOpen(false); queryClient.invalidateQueries({ queryKey: getListAnimalsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetAnimalQueryKey(selectedId) }); } }); } else { create.mutate({ data: form }, { onSuccess: () => { setOpen(false); setForm({ name: '', species: 'dog', breed: '', age: '', location: '', status: 'available', imageUrl: '', description: '', vaccinated: false }); queryClient.invalidateQueries({ queryKey: getListAnimalsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); } }); } };
  const startEdit = (animal: Animal) => { setSelectedId(animal.id); setForm({ name: animal.name, species: animal.species, breed: animal.breed, age: animal.age, location: animal.location, status: animal.status, imageUrl: animal.imageUrl, description: animal.description, vaccinated: animal.vaccinated }); setOpen(true); };
  return <Shell><PageHeading eyebrow="Digital records" title="Your animal care file." detail="Keep the details that help every caregiver do their best work: identity, vaccinations, notes, and the people around them." action={<Button onClick={() => { setSelectedId(null); setForm({ name: '', species: 'dog', breed: '', age: '', location: '', status: 'available', imageUrl: '', description: '', vaccinated: false }); setOpen(true); }} testId="button-add-animal"><Plus size={17} /> Add animal</Button>} />
    {open && <form onSubmit={submit} className="mb-7 rounded-2xl border border-card-border bg-card p-5 shadow-sm md:p-7" data-testid="form-animal"><div className="mb-5 flex items-center justify-between"><div><div className="text-xs font-bold uppercase tracking-[.15em] text-primary">{selectedId ? 'Update profile' : 'New profile'}</div><h2 className="mt-2 font-display text-2xl font-bold">{selectedId ? 'Keep their record current' : 'Add an animal to the desk'}</h2></div><button type="button" onClick={() => setOpen(false)} data-testid="button-close-animal-form"><X size={18} /></button></div><div className="grid gap-4 md:grid-cols-2"><Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Animal's name" testId="input-animal-name" /><label className="text-sm font-bold">Species<select disabled={Boolean(selectedId)} value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-normal" data-testid="select-animal-species"><option value="dog">Dog</option><option value="cat">Cat</option><option value="rabbit">Rabbit</option><option value="other">Other</option></select></label><Field label="Breed" value={form.breed} onChange={(v) => setForm({ ...form, breed: v })} placeholder="Breed or mix" testId="input-animal-breed" /><Field label="Age" value={form.age} onChange={(v) => setForm({ ...form, age: v })} placeholder="e.g. 2 years" testId="input-animal-age" /><Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="Neighborhood" testId="input-animal-location" /><label className="text-sm font-bold">Care status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-normal" data-testid="select-animal-status"><option value="available">Available for adoption</option><option value="foster">In foster care</option><option value="adopted">Adopted</option><option value="medical">Medical hold</option></select></label><Field label="Photo URL (optional)" value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} placeholder="https://…" testId="input-animal-image" /><label className="flex items-center gap-3 self-end rounded-xl bg-muted px-4 py-3 text-sm font-bold"><input type="checkbox" checked={form.vaccinated} onChange={(e) => setForm({ ...form, vaccinated: e.target.checked })} className="h-4 w-4 accent-[hsl(var(--primary))]" data-testid="checkbox-animal-vaccinated" /> Vaccinations up to date</label><label className="text-sm font-bold md:col-span-2">Care notes<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-normal" placeholder="Temperament, medical history, favorite things…" data-testid="textarea-animal-description" /></label></div><div className="mt-5"><Button type="submit" disabled={create.isPending || update.isPending} testId="button-submit-animal">{create.isPending || update.isPending ? 'Saving…' : selectedId ? 'Save changes' : 'Create profile'} <Check size={16} /></Button></div></form>}
    {detail.data && <div className="mb-7 rounded-2xl border border-accent bg-accent/30 p-5"><div className="flex items-center justify-between"><div><span className="text-xs font-bold uppercase tracking-[.15em] text-chart-2">Selected profile</span><h2 className="mt-1 font-display text-2xl font-bold">{detail.data.name}</h2><p className="text-sm text-muted-foreground">{detail.data.breed} · {detail.data.age} · {detail.data.location}</p></div><Button variant="soft" onClick={() => startEdit(detail.data!)} testId="button-edit-selected-animal">Edit record</Button></div><div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-card px-3 py-1.5">{detail.data.vaccinated ? 'Vaccinations up to date' : 'Vaccination review needed'}</span><span className="rounded-full bg-card px-3 py-1.5">{detail.data.status}</span></div></div>}
    {animals.isLoading ? <StateMessage type="loading" text="" /> : animals.isError ? <StateMessage type="error" text="Animal profiles are unavailable right now." onRetry={() => animals.refetch()} /> : !animals.data?.length ? <StateMessage type="empty" text="No profiles yet. Add an animal to start a shared care record." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{animals.data.map((animal) => <AnimalCard key={animal.id} animal={animal} onSelect={() => setSelectedId(animal.id)} />)}</div>}
  </Shell>;
}

function Field({ label, value, onChange, placeholder, testId }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; testId: string }) {
  return <label className="text-sm font-bold">{label}<input required value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-normal outline-none focus:border-primary" data-testid={testId} /></label>;
}

function Router() {
  return <ErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/adoption" component={Adoption} /><Route path="/emergency" component={Emergency} /><Route path="/lost-found" component={LostFound} /><Route path="/vets" component={Vets} /><Route path="/assistant" component={Assistant} /><Route path="/animals" component={Animals} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;