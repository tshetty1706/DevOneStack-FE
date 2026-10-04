import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Spin, Button, Empty, message, Pagination } from 'antd';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/layout/Logo';
import DashboardNav from '../components/dashboard/DashboardNav';
import ContinueWorking from '../components/dashboard/ContinueWorking';
import RecentActivity from '../components/dashboard/RecentActivity';
import PinnedResources from '../components/dashboard/PinnedResources';
import CommandPalette from '../components/dashboard/CommandPalette';
import { useSpaces } from '../hooks/useSpaces';
import ToolSpacesGrid from '../components/dashboard/ToolSpacesGrid';
import CommunityPostCard from '../components/community/CommunityPostCard';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { communityApi } from '../api/communityApi';
import { spacesApi } from '../api/spacesApi';
import {
  RiAddLine,
  RiStarFill,
  RiCompassLine,
  RiArticleLine,
  RiEditLine,
} from 'react-icons/ri';

function DashboardContent() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState('dashboard');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [myPostsPage, setMyPostsPage] = useState(1);

  const { data: spaces = [], isLoading: spacesLoading } = useSpaces();

  // Query for Starred Spaces
  const {
    data: starredSpaces = [],
    isLoading: starredLoading,
  } = useQuery({
    queryKey: ['spaces', 'starred'],
    queryFn: () => spacesApi.getSpaces({ tab: 'starred' }),
    enabled: activeView === 'starred' && !!user,
  });

  // Query for User's Community Posts
  const {
    data: myPostsData,
    isLoading: myPostsLoading,
  } = useQuery({
    queryKey: ['community', 'my-posts', myPostsPage],
    queryFn: () => communityApi.getMyPosts({ page: myPostsPage, limit: 10 }),
    enabled: activeView === 'my-posts' && !!user,
  });

  const isLight = theme === 'light';
  const bg = 'var(--bg-color)';
  const textMuted = 'var(--text-secondary)';

  const userName = localStorage.getItem('dos_profile_name') || user?.displayName || user?.username || 'Developer';

  // Keyboard shortcut: Cmd+K / Ctrl+K to open CommandPalette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const view = searchParams.get('view') || searchParams.get('tab');
    if (view === 'spaces') {
      setActiveView('spaces');
    } else if (view === 'starred') {
      setActiveView('starred');
    } else if (view === 'my-posts') {
      setActiveView('my-posts');
    } else if (view && view !== 'dashboard') {
      setActiveView(view);
    } else {
      setActiveView('dashboard');
    }
  }, [searchParams]);

  const handleSetView = (view) => {
    setActiveView(view);
    setSearchParams({ view });
  };

  const handleNavigateCreateSpace = () => {
    navigate(`/u/${encodeURIComponent(user?.username || 'user')}/spaces/create`);
  };

  const handlePostDeleted = (deletedId) => {
    queryClient.setQueryData(['community', 'my-posts', myPostsPage], (old) => {
      if (!old) return old;
      return {
        ...old,
        posts: (old.posts || []).filter((p) => p._id !== deletedId),
        total: Math.max(0, (old.total || 1) - 1),
      };
    });
  };

  const handlePostUpdated = (updatedPost) => {
    queryClient.setQueryData(['community', 'my-posts', myPostsPage], (old) => {
      if (!old) return old;
      return {
        ...old,
        posts: (old.posts || []).map((p) => (p._id === updatedPost._id ? updatedPost : p)),
      };
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: bg, overflow: 'hidden', position: 'relative' }}>

      {/* Background Flowing Orbs */}
      <div className="hero-background-flow" style={{ opacity: isLight ? 0.01 : 0.03 }}>
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-3" />
      </div>

      {/* Left Sidebar */}
      <DashboardSidebar
        activeView={activeView}
        setActiveView={handleSetView}
      />

      {/* Right Main Body */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
        minWidth: 0,
      }}>
        {/* Top Navbar Header */}
        <DashboardNav
          onSearchOpen={() => setPaletteOpen(true)}
          onNewSpaceClick={handleNavigateCreateSpace}
        />

        {/* Scrollable Main Area */}
        <motion.main
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'clamp(20px, 3.5vw, 36px) clamp(16px, 4vw, 40px) 80px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {activeView === 'dashboard' ? (
            <>
              {/* Welcome Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '4px',
              }}>
                <div style={{ minWidth: '220px' }}>
                  <h1 style={{
                    fontSize: 'clamp(22px, 3.5vw, 26px)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.02em',
                    marginBottom: '4px',
                    color: isLight ? "#16161a" : "#fff"
                  }}>
                    Welcome back, {userName}! 👋
                  </h1>
                  <p style={{ fontSize: '13px', color: textMuted, margin: 0 }}>
                    Let's continue building and organizing your knowledge.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNavigateCreateSpace}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--accent-color)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    minHeight: '42px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = isLight ? '#4338ca' : '#4f46e5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-color)'}
                >
                  <RiAddLine size={17} />
                  <span>Create New Space</span>
                </button>
              </div>

              {/* Continue working where you left off */}
              <ContinueWorking />

              {/* Side-by-Side: Recent Activity and Pinned Resources */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                gap: '24px',
                width: '100%',
              }}>
                <RecentActivity />
                <PinnedResources />
              </div>
            </>
          ) : activeView === 'spaces' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
              {spacesLoading ? (
                <div style={{ color: textMuted, fontSize: '14px', padding: '40px 0', textAlign: 'center' }}>
                  Loading spaces...
                </div>
              ) : (
                <ToolSpacesGrid
                  spaces={spaces}
                  onAddSpaceClick={handleNavigateCreateSpace}
                />
              )}
            </div>
          ) : activeView === 'starred' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
              {/* Starred Stacks Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}>
                <div>
                  <h1 style={{
                    fontSize: 'clamp(20px, 3vw, 24px)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    margin: '0 0 4px',
                    color: isLight ? '#16161a' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    <RiStarFill size={22} color="#f59e0b" />
                    <span>Starred Stacks</span>
                  </h1>
                  <p style={{ fontSize: '13px', color: textMuted, margin: 0 }}>
                    Quick access to public spaces you've starred across the community.
                  </p>
                </div>

                <Button
                  icon={<RiCompassLine size={16} />}
                  onClick={() => navigate('/community')}
                  style={{
                    borderRadius: '8px',
                    fontWeight: 600,
                  }}
                >
                  Discover More Spaces
                </Button>
              </div>

              {/* Starred Grid or Empty State */}
              {starredLoading ? (
                <div style={{ color: textMuted, fontSize: '14px', padding: '60px 0', textAlign: 'center' }}>
                  <Spin size="large" />
                </div>
              ) : starredSpaces.length === 0 ? (
                <div style={{
                  background: isLight ? '#ffffff' : '#111218',
                  border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '16px',
                  padding: '60px 24px',
                  textAlign: 'center',
                }}>
                  <Empty
                    description={
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-color)', fontWeight: 600, fontSize: '15px' }}>
                          No Starred Stacks yet
                        </span>
                        <span style={{ color: textMuted, fontSize: '13px', maxWidth: '400px' }}>
                          Star public spaces you find interesting in the Community or Discover tab to quickly find them here.
                        </span>
                      </div>
                    }
                  >
                    <Button
                      type="primary"
                      icon={<RiCompassLine size={16} />}
                      onClick={() => navigate('/community')}
                      style={{ marginTop: '12px', borderRadius: '8px' }}
                    >
                      Explore Community
                    </Button>
                  </Empty>
                </div>
              ) : (
                <ToolSpacesGrid
                  spaces={starredSpaces}
                  onAddSpaceClick={handleNavigateCreateSpace}
                />
              )}
            </div>
          ) : activeView === 'my-posts' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '900px' }}>
              {/* My Posts Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}>
                <div>
                  <h1 style={{
                    fontSize: 'clamp(20px, 3vw, 24px)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    margin: '0 0 4px',
                    color: isLight ? '#16161a' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    <RiArticleLine size={22} color="var(--accent-color)" />
                    <span>My Community Posts</span>
                  </h1>
                  <p style={{ fontSize: '13px', color: textMuted, margin: 0 }}>
                    Track, manage, and view engagement on your shared posts and attached spaces.
                  </p>
                </div>

                <Button
                  type="primary"
                  icon={<RiEditLine size={16} />}
                  onClick={() => navigate('/community')}
                  style={{
                    borderRadius: '8px',
                    fontWeight: 600,
                  }}
                >
                  Create Post
                </Button>
              </div>

              {/* My Posts Content */}
              {myPostsLoading ? (
                <div style={{ color: textMuted, fontSize: '14px', padding: '60px 0', textAlign: 'center' }}>
                  <Spin size="large" />
                </div>
              ) : !myPostsData?.posts || myPostsData.posts.length === 0 ? (
                <div style={{
                  background: isLight ? '#ffffff' : '#111218',
                  border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '16px',
                  padding: '60px 24px',
                  textAlign: 'center',
                }}>
                  <Empty
                    description={
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-color)', fontWeight: 600, fontSize: '15px' }}>
                          You haven't posted yet
                        </span>
                        <span style={{ color: textMuted, fontSize: '13px', maxWidth: '400px' }}>
                          Share ideas, code snippets, project milestones, or public spaces with the developer community!
                        </span>
                      </div>
                    }
                  >
                    <Button
                      type="primary"
                      icon={<RiEditLine size={16} />}
                      onClick={() => navigate('/community')}
                      style={{ marginTop: '12px', borderRadius: '8px' }}
                    >
                      Share with Community
                    </Button>
                  </Empty>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {myPostsData.posts.map((post) => (
                    <CommunityPostCard
                      key={post._id}
                      post={post}
                      onPostDeleted={handlePostDeleted}
                      onPostUpdated={handlePostUpdated}
                      onFollowChange={() => {}}
                    />
                  ))}

                  {/* Pagination */}
                  {myPostsData.total > 10 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                      <Pagination
                        current={myPostsPage}
                        pageSize={10}
                        total={myPostsData.total}
                        onChange={(p) => setMyPostsPage(p)}
                        showSizeChanger={false}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: textMuted, padding: '80px 24px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-color)', marginBottom: '8px' }}>Coming Soon</h3>
              <p style={{ fontSize: '14px', color: textMuted }}>This workspace view is under construction.</p>
            </div>
          )}
        </motion.main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
