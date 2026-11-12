import { Link } from 'expo-router';
import type { Href } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Profile = {
  id: string;
  role: string | null;
};

const shopItems = [
  {
    name: 'Potion of Focus',
    type: 'Consumable',
    description:
      'A rare reward to keep adventurers motivated on their journey.',
    price: '80',
    stock: 'Unlimited',
    status: 'Published',
  },
  {
    name: 'Ember Fox',
    type: 'Pet',
    description: 'A bright companion for the road ahead.',
    price: '1200',
    stock: '25',
    status: 'Published',
  },
  {
    name: "Knight's Mantle",
    type: 'Armor',
    description: 'A little extra courage for your next quest.',
    price: '650',
    stock: '12',
    status: 'Draft',
  },
  {
    name: 'Moonstone Theme',
    type: 'Theme',
    description: 'A calm, moonlit look for your guild.',
    price: '400',
    stock: 'Unlimited',
    status: 'Published',
  },
];

const dailyActivity = [24, 31, 37, 34, 45, 41, 52, 48, 61, 55, 66, 63, 71];
const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const categories = [
  { name: 'Health & Fitness', value: '32%', color: '#b77932' },
  { name: 'Learning', value: '24%', color: '#3e9b86' },
  { name: 'Productivity', value: '21%', color: '#e5a044' },
  { name: 'Mindfulness', value: '15%', color: '#6793bb' },
  { name: 'Other', value: '8%', color: '#aaa6a0' },
];
type AdminHref =
  | '/admin'
  | '/admin/users'
  | '/admin/analytics'
  | '/admin/achievements'
  | '/admin/shop';

type Achievement = {
  id: string;
  icon: string;
  title: string;
  criteria: string;
};

const initialAchievements: Achievement[] = [
  {
    id: 'ACH-001',
    icon: '⚔',
    title: 'First quest',
    criteria: 'Complete your first quest',
  },
  {
    id: 'ACH-002',
    icon: '♨',
    title: 'Kindled flame',
    criteria: 'Reach a 3 day habit streak',
  },
  {
    id: 'ACH-003',
    icon: '▤',
    title: 'Eager scholar',
    criteria: 'Complete a study habit',
  },
  {
    id: 'ACH-004',
    icon: '⚔',
    title: 'Quest knight',
    criteria: 'Complete 10 quests',
  },
  {
    id: 'ACH-005',
    icon: '♨',
    title: 'Steadfast soul',
    criteria: 'Reach a 7 day streak',
  },
];

function Arrow({ direction = 'right' }: { direction?: 'right' | 'down' }) {
  return <span aria-hidden="true">{direction === 'right' ? '→' : '⌄'}</span>;
}

function Icon({ children }: { children: string }) {
  return (
    <span className="admin-icon" aria-hidden="true">
      {children}
    </span>
  );
}

function DashboardLink({
  href,
  children,
  className,
}: {
  href: AdminHref;
  children: ReactNode;
  className: string;
}) {
  return (
    <Link href={href as Href} asChild>
      <a className={className}>{children}</a>
    </Link>
  );
}

function MetricCard({
  icon,
  label,
  value,
  change,
  tone = 'gold',
}: {
  icon: string;
  label: string;
  value: string;
  change: string;
  tone?: 'gold' | 'green' | 'purple' | 'blue';
}) {
  return (
    <article className="metric-card">
      <div className={`metric-icon metric-icon-${tone}`}>
        <Icon>{icon}</Icon>
      </div>
      <div className="metric-copy">
        <span className="metric-label">{label}</span>
        <strong className="metric-value">{value}</strong>
        <span className="metric-change">{change}</span>
      </div>
    </article>
  );
}

function ActivityChart({ compact = false }: { compact?: boolean }) {
  const points = dailyActivity
    .map((value, index) => `${36 + index * 42},${180 - value * 1.65}`)
    .join(' ');

  return (
    <div
      className={`activity-chart${compact ? ' activity-chart-compact' : ''}`}
    >
      <svg
        viewBox="0 0 540 218"
        role="img"
        aria-label="Illustrative guild activity over the last seven days"
      >
        <defs>
          <linearGradient id="activity-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#c99434" stopOpacity=".23" />
            <stop offset="100%" stopColor="#c99434" stopOpacity=".015" />
          </linearGradient>
        </defs>
        {[35, 80, 125, 170].map((y) => (
          <line key={y} x1="36" x2="534" y1={y} y2={y} className="chart-grid" />
        ))}
        <polygon
          points={`36,180 ${points} 534,180`}
          fill="url(#activity-fill)"
        />
        <polyline points={points} fill="none" className="chart-line" />
        <text x="0" y="39" className="chart-axis">
          1.5k
        </text>
        <text x="0" y="84" className="chart-axis">
          1k
        </text>
        <text x="0" y="129" className="chart-axis">
          500
        </text>
        <text x="17" y="174" className="chart-axis">
          0
        </text>
        {dayLabels.map((label, index) => (
          <text
            key={label}
            x={36 + index * 83}
            y="207"
            textAnchor="middle"
            className="chart-axis"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children ? <div className="heading-actions">{children}</div> : null}
    </div>
  );
}

function PreviewNotice() {
  return (
    <div className="preview-notice">
      <span className="notice-dot" />
      Preview data — connect an analytics source to show live metrics.
    </div>
  );
}

export function OverviewPage() {
  const [notice, setNotice] = useState('');

  return (
    <div className="dashboard-page">
      <PageHeading
        eyebrow="GuildMaster admin"
        title="Good morning, Guild Keeper"
        description="Your realm is thriving. Here’s what needs your attention today."
      >
        <button
          className="button button-primary"
          onClick={() =>
            setNotice(
              'Reports are available when an analytics data source is connected.'
            )
          }
        >
          <span aria-hidden="true">✦</span> Generate report
        </button>
      </PageHeading>
      {notice ? (
        <div className="inline-notice" role="status">
          {notice}
        </div>
      ) : null}
      <PreviewNotice />
      <section className="metric-grid" aria-label="Guild overview">
        <MetricCard
          icon="♙"
          label="Active adventurers"
          value="12,482"
          change="+8.2% this month"
          tone="purple"
        />
        <MetricCard
          icon="✦"
          label="Tasks completed"
          value="48,209"
          change="+12.4% this week"
          tone="gold"
        />
        <MetricCard
          icon="✧"
          label="AI tokens used"
          value="1.84M"
          change="72% of monthly limit"
          tone="blue"
        />
        <MetricCard
          icon="▣"
          label="Shop revenue"
          value="84,620"
          change="+6.8% this month"
          tone="green"
        />
      </section>
      <section className="dashboard-grid overview-grid">
        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Guild activity</h2>
              <p>Tasks completed over the last 7 days</p>
            </div>
            <span className="soft-chip">
              Last 7 days <Arrow direction="down" />
            </span>
          </div>
          <ActivityChart />
        </article>
        <article className="panel attention-panel">
          <div className="panel-heading">
            <div>
              <h2>Needs attention</h2>
              <p>Items requiring review</p>
            </div>
            <span className="count-badge">4</span>
          </div>
          <div className="attention-list">
            <DashboardLink href="/admin/analytics" className="attention-item">
              <span className="attention-symbol attention-gold">⌁</span>
              <span>
                <strong>Suspicious AI usage</strong>
                <small>3 accounts flagged</small>
              </span>
              <Arrow />
            </DashboardLink>
            <DashboardLink href="/admin/users" className="attention-item">
              <span className="attention-symbol attention-orange">♙</span>
              <span>
                <strong>Pending account appeals</strong>
                <small>2 awaiting response</small>
              </span>
              <Arrow />
            </DashboardLink>
            <DashboardLink href="/admin/shop" className="attention-item">
              <span className="attention-symbol attention-green">✧</span>
              <span>
                <strong>Draft quest templates</strong>
                <small>3 items need review</small>
              </span>
              <Arrow />
            </DashboardLink>
          </div>
          <DashboardLink href="/admin/users" className="panel-link">
            View all activity <Arrow />
          </DashboardLink>
        </article>
      </section>
      <article className="panel category-preview">
        <div className="panel-heading">
          <div>
            <h2>Top task categories</h2>
            <p>Popular across your realm this week</p>
          </div>
          <DashboardLink href="/admin/analytics" className="panel-link">
            View analytics <Arrow />
          </DashboardLink>
        </div>
        <div className="category-chips">
          {categories.slice(0, 4).map((category) => (
            <span key={category.name} className="category-chip">
              <i style={{ backgroundColor: category.color }} />
              {category.name}
              <strong>{category.value}</strong>
            </span>
          ))}
        </div>
      </article>
    </div>
  );
}

export function AccountsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showInvite, setShowInvite] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let active = true;
    async function loadProfiles() {
      setLoading(true);
      setError('');
      const { data, error: requestError } = await supabase
        .from('profiles')
        .select('id, role')
        .order('id');
      if (!active) return;
      if (requestError) {
        setError(`Could not load accounts: ${requestError.message}`);
      } else {
        setProfiles(data ?? []);
      }
      setLoading(false);
    }
    void loadProfiles();
    return () => {
      active = false;
    };
  }, []);

  const visibleProfiles = useMemo(
    () =>
      profiles.filter((profile) => {
        const matchesSearch = `${profile.id} ${profile.role ?? ''}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || profile.role === roleFilter;
        return matchesSearch && matchesRole;
      }),
    [profiles, roleFilter, search]
  );

  return (
    <div className="dashboard-page">
      <PageHeading
        eyebrow="GuildMaster admin"
        title="Account management"
        description="Manage adventurers, permissions, and account access."
      >
        <button
          className="button button-primary"
          onClick={() => setShowInvite(true)}
        >
          <span aria-hidden="true">＋</span> Invite administrator
        </button>
      </PageHeading>
      <section className="panel account-toolbar">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by account ID or role"
            aria-label="Search accounts"
          />
        </label>
        <label className="select-field">
          <span className="sr-only">Filter by role</span>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">Adventurer</option>
          </select>
        </label>
      </section>
      {error ? (
        <div className="error-notice" role="alert">
          {error}
        </div>
      ) : null}
      <section className="panel table-panel">
        <div className="table-scroll">
          <table className="accounts-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Account ID</th>
                <th>Role</th>
                <th>Access</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="table-message" colSpan={5}>
                    Loading accounts…
                  </td>
                </tr>
              ) : null}
              {!loading &&
                !error &&
                visibleProfiles.map((profile) => (
                  <tr key={profile.id}>
                    <td>
                      <div className="account-name">
                        <span className="avatar">
                          {profile.id.slice(0, 2).toUpperCase()}
                        </span>
                        <strong>Adventurer {profile.id.slice(0, 6)}</strong>
                      </div>
                    </td>
                    <td className="muted-cell">{profile.id}</td>
                    <td>
                      <span
                        className={`role-chip ${profile.role === 'admin' ? 'role-admin' : ''}`}
                      >
                        {profile.role ?? 'User'}
                      </span>
                    </td>
                    <td>
                      <span className="status-chip">
                        <i />
                        Registered
                      </span>
                    </td>
                    <td>
                      <button
                        className="icon-button"
                        onClick={() => setSelectedProfile(profile)}
                        aria-label={`View account details for ${profile.id}`}
                        title="View account details"
                      >
                        ···
                      </button>
                    </td>
                  </tr>
                ))}
              {!loading && !error && visibleProfiles.length === 0 ? (
                <tr>
                  <td className="table-message" colSpan={5}>
                    No accounts match your search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          {loading
            ? 'Loading accounts'
            : `${visibleProfiles.length} account${visibleProfiles.length === 1 ? '' : 's'}`}{' '}
          <span>Account records provided by Supabase profiles.</span>
        </div>
      </section>
      {showInvite ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowInvite(false);
          }}
        >
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-title"
          >
            <button
              className="modal-close"
              aria-label="Close dialog"
              onClick={() => setShowInvite(false)}
            >
              ×
            </button>
            <div className="eyebrow">Admin access</div>
            <h2 id="invite-title">Invite an administrator</h2>
            <p>
              Administrator invitations need a server-side Supabase invitation
              endpoint. This project currently exposes profile data only, so no
              invitation will be sent from this dashboard.
            </p>
            <button
              className="button button-primary modal-action"
              onClick={() => setShowInvite(false)}
            >
              Got it
            </button>
          </section>
        </div>
      ) : null}
      {selectedProfile ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedProfile(null);
          }}
        >
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-details-title"
          >
            <button
              className="modal-close"
              aria-label="Close dialog"
              onClick={() => setSelectedProfile(null)}
            >
              ×
            </button>
            <div className="eyebrow">Account details</div>
            <h2 id="account-details-title">
              Adventurer {selectedProfile.id.slice(0, 6)}
            </h2>
            <dl className="account-details">
              <div>
                <dt>Account ID</dt>
                <dd>{selectedProfile.id}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{selectedProfile.role ?? 'User'}</dd>
              </div>
            </dl>
            <p>
              These are the account fields currently available from the profiles
              table.
            </p>
            <button
              className="button button-primary modal-action"
              onClick={() => setSelectedProfile(null)}
            >
              Close
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export function AnalyticsPage() {
  const [range, setRange] = useState('30 days');
  return (
    <div className="dashboard-page">
      <PageHeading
        eyebrow="GuildMaster admin · sample insights"
        title="Analytics"
        description="Understand AI usage and how adventurers organize their goals."
      >
        <label className="select-field date-select">
          <span className="sr-only">Analytics date range</span>
          <select
            value={range}
            onChange={(event) => setRange(event.target.value)}
          >
            <option>Last 7 days</option>
            <option>30 days</option>
            <option>90 days</option>
          </select>
        </label>
      </PageHeading>
      <PreviewNotice />
      <section className="metric-grid analytics-metrics">
        <MetricCard
          icon="✧"
          label="AI requests"
          value="86,420"
          change="+14.2% vs. May"
          tone="gold"
        />
        <MetricCard
          icon="⌁"
          label="Tokens consumed"
          value="1.84M"
          change="72% of 2.5M limit"
          tone="blue"
        />
        <MetricCard
          icon="♙"
          label="Avg. per user"
          value="147"
          change="+3.1% vs. May"
          tone="purple"
        />
        <MetricCard
          icon="✦"
          label="AI success rate"
          value="96.8%"
          change="+1.4% vs. May"
          tone="green"
        />
      </section>
      <section className="dashboard-grid analytics-grid">
        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Guild activity</h2>
              <p>Tasks completed over the last {range.toLowerCase()}</p>
            </div>
            <span className="soft-chip">
              Last 7 days <Arrow direction="down" />
            </span>
          </div>
          <ActivityChart />
        </article>
        <article className="panel category-panel">
          <div className="panel-heading">
            <div>
              <h2>To-do categories</h2>
              <p>Tasks created this month</p>
            </div>
          </div>
          <div className="donut-wrap">
            <div className="donut-chart">
              <div className="donut-center">
                <strong>39.4k</strong>
                <span>Total tasks</span>
              </div>
            </div>
          </div>
          <div className="legend-list">
            {categories.map((category) => (
              <div className="legend-item" key={category.name}>
                <span>
                  <i style={{ backgroundColor: category.color }} />
                  {category.name}
                </span>
                <strong>{category.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>
      <article className="panel detail-panel">
        <div className="panel-heading">
          <div>
            <h2>AI usage trend</h2>
            <p>Illustrative request volume by day</p>
          </div>
          <span className="legend-label">
            <i />
            Requests
          </span>
        </div>
        <ActivityChart compact />
      </article>
    </div>
  );
}

export function AchievementsPage() {
  const [achievements, setAchievements] = useState(initialAchievements);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [notice, setNotice] = useState('');

  const visibleAchievements = achievements.filter((achievement) =>
    `${achievement.title} ${achievement.criteria}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function saveAchievement() {
    if (!editing) return;
    if (!editing.title.trim() || !editing.criteria.trim()) {
      setNotice('Add a title and unlock criteria before saving.');
      return;
    }
    setAchievements((current) =>
      current.some((achievement) => achievement.id === editing.id)
        ? current.map((achievement) =>
            achievement.id === editing.id ? editing : achievement
          )
        : [...current, editing]
    );
    setEditing(null);
    setNotice(
      'Achievement saved for this browser session. Connect an achievements table to persist changes.'
    );
  }

  function deleteAchievement(id: string) {
    setAchievements((current) =>
      current.filter((achievement) => achievement.id !== id)
    );
    setNotice('Achievement removed from this browser session.');
  }

  return (
    <div className="dashboard-page achievements-page">
      <PageHeading
        eyebrow="GuildMaster admin"
        title="Achievement manager"
        description="Create and manage the milestones adventurers can earn."
      >
        <button
          className="button button-primary"
          onClick={() =>
            setEditing({
              id: `ACH-${String(achievements.length + 1).padStart(3, '0')}`,
              icon: '✦',
              title: '',
              criteria: '',
            })
          }
        >
          <span aria-hidden="true">＋</span> Add New Achievement
        </button>
      </PageHeading>
      {notice ? (
        <div className="inline-notice" role="status">
          {notice}
        </div>
      ) : null}
      <section className="panel achievement-toolbar">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search achievements by title or criteria"
            aria-label="Search achievements"
          />
        </label>
        <span className="achievement-count">
          {visibleAchievements.length} achievement
          {visibleAchievements.length === 1 ? '' : 's'}
        </span>
      </section>
      <section className="panel achievement-table-panel">
        <div className="table-scroll">
          <table className="achievement-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Title</th>
                <th>Unlock criteria</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleAchievements.map((achievement) => (
                <tr key={achievement.id}>
                  <td>
                    <span className="achievement-icon">{achievement.icon}</span>
                  </td>
                  <td>
                    <div className="achievement-title">
                      <strong>{achievement.title}</strong>
                      <small>{achievement.id}</small>
                    </div>
                  </td>
                  <td>{achievement.criteria}</td>
                  <td>
                    <div className="achievement-actions">
                      <button
                        className="button button-small button-edit"
                        onClick={() => {
                          setEditing(achievement);
                          setNotice('');
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="button button-small button-delete"
                        onClick={() => deleteAchievement(achievement.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleAchievements.length === 0 ? (
                <tr>
                  <td className="table-message" colSpan={4}>
                    No achievements match your search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Showing all {visibleAchievements.length} achievements</span>
          <span>Page 1 of 1</span>
        </div>
      </section>
      {editing ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditing(null);
          }}
        >
          <section
            className="modal-card achievement-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="achievement-editor-title"
          >
            <button
              className="modal-close"
              aria-label="Close dialog"
              onClick={() => setEditing(null)}
            >
              ×
            </button>
            <div className="eyebrow">
              {editing.title ? 'Edit achievement' : 'New achievement'}
            </div>
            <h2 id="achievement-editor-title">
              {editing.title || 'Add an achievement'}
            </h2>
            <label className="form-field">
              Icon
              <input
                value={editing.icon}
                maxLength={2}
                onChange={(event) =>
                  setEditing({ ...editing, icon: event.target.value })
                }
              />
            </label>
            <label className="form-field">
              Title
              <input
                value={editing.title}
                onChange={(event) =>
                  setEditing({ ...editing, title: event.target.value })
                }
                autoFocus
              />
            </label>
            <label className="form-field">
              Unlock criteria
              <textarea
                rows={3}
                value={editing.criteria}
                onChange={(event) =>
                  setEditing({ ...editing, criteria: event.target.value })
                }
              />
            </label>
            <div className="modal-actions">
              <button
                className="button button-secondary"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button
                className="button button-primary"
                onClick={saveAchievement}
              >
                Save achievement
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export function ShopPage() {
  const [items, setItems] = useState(shopItems);
  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [published, setPublished] = useState(items[0].status === 'Published');
  const item = items[selected];
  const filteredItems = items
    .map((entry, index) => ({ ...entry, index }))
    .filter((entry) => entry.name.toLowerCase().includes(search.toLowerCase()));

  function updateItem<K extends keyof (typeof shopItems)[number]>(
    key: K,
    value: (typeof shopItems)[number][K]
  ) {
    setItems((current) =>
      current.map((entry, index) =>
        index === selected ? { ...entry, [key]: value } : entry
      )
    );
    if (key === 'status') setPublished(value === 'Published');
  }

  function addItem() {
    const newItem = {
      name: 'New reward',
      type: 'Consumable',
      description: '',
      price: '0',
      stock: 'Unlimited',
      status: 'Draft',
    };
    setItems((current) => [...current, newItem]);
    setSelected(items.length);
    setPublished(false);
    setNotice('');
  }

  function saveChanges(isPublished: boolean) {
    updateItem('status', isPublished ? 'Published' : 'Draft');
    setNotice(
      'Preview updated for this browser session. Catalog changes are not connected to a database.'
    );
  }

  return (
    <div className="dashboard-page shop-page">
      <PageHeading
        eyebrow="GuildMaster admin"
        title="Shop editor"
        description="Curate rewards, gear, companions, and seasonal stock."
      >
        <button className="button button-primary" onClick={addItem}>
          <span aria-hidden="true">＋</span> New item
        </button>
      </PageHeading>
      {notice ? (
        <div className="inline-notice" role="status">
          {notice}
        </div>
      ) : null}
      <div className="shop-layout">
        <section className="panel item-list-panel">
          <label className="search-field item-search">
            <span aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search items"
              aria-label="Search shop items"
            />
          </label>
          <div className="shop-items">
            {filteredItems.map((entry) => (
              <button
                key={entry.index}
                className={`shop-item${selected === entry.index ? ' selected' : ''}`}
                onClick={() => {
                  setSelected(entry.index);
                  setPublished(items[entry.index].status === 'Published');
                  setNotice('');
                }}
              >
                <span className="item-sigil">✦</span>
                <span className="shop-item-copy">
                  <strong>{entry.name}</strong>
                  <small>
                    {entry.type} · {entry.price} gold
                  </small>
                </span>
                <Arrow />
              </button>
            ))}
            {filteredItems.length === 0 ? (
              <p className="empty-items">No matching shop items.</p>
            ) : null}
          </div>
        </section>
        {item ? (
          <section className="panel editor-panel">
            <div className="editor-heading">
              <div>
                <div className="eyebrow">Item details</div>
                <h2>{item.name || 'New reward'}</h2>
              </div>
              <span
                className={`publish-badge ${published ? '' : 'draft-badge'}`}
              >
                {published ? 'Published' : 'Draft'}
              </span>
            </div>
            <label className="form-field">
              Name
              <input
                value={item.name}
                onChange={(event) => updateItem('name', event.target.value)}
              />
            </label>
            <label className="form-field">
              Item type
              <select
                value={item.type}
                onChange={(event) => updateItem('type', event.target.value)}
              >
                <option>Consumable</option>
                <option>Pet</option>
                <option>Armor</option>
                <option>Theme</option>
                <option>Accessory</option>
              </select>
            </label>
            <label className="form-field form-field-wide">
              Description
              <textarea
                rows={4}
                value={item.description}
                onChange={(event) =>
                  updateItem('description', event.target.value)
                }
              />
            </label>
            <label className="form-field">
              Price (gold)
              <input
                type="number"
                min="0"
                value={item.price}
                onChange={(event) => updateItem('price', event.target.value)}
              />
            </label>
            <label className="form-field">
              Stock
              <input
                value={item.stock}
                onChange={(event) => updateItem('stock', event.target.value)}
              />
            </label>
            <div className="editor-actions">
              <span className="editor-preview-label">Session preview</span>
              <button
                className="button button-secondary"
                onClick={() => saveChanges(false)}
              >
                Save draft
              </button>
              <button
                className="button button-primary"
                onClick={() => saveChanges(true)}
              >
                Publish changes
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
