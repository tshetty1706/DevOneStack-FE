import React, { useState, useEffect } from 'react';
import { RiFolder5Line, RiTerminalBoxLine } from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';

const ICON_ALIASES = {
  'simple-icons:java': 'devicon:java',
  'simple-icons:aws': 'logos:aws',
  'simple-icons:amazonwebservices': 'logos:aws',
  'simple-icons:vue': 'devicon:vuejs',
  'simple-icons:vuejs': 'devicon:vuejs',
  'simple-icons:csharp': 'devicon:csharp',
  'simple-icons:vscode': 'devicon:vscode',
  'simple-icons:nuxtdotjs': 'simple-icons:nuxt',
  'simple-icons:microsoftazure': 'logos:azure-icon',
  'simple-icons:css3': 'logos:css-3',
  'simple-icons:heroku': 'logos:heroku-icon',
  'simple-icons:playwright': 'logos:playwright',
  'simple-icons:windows': 'logos:microsoft-windows',
  'simple-icons:slack': 'logos:slack-icon',
  'simple-icons:openai': 'logos:openai-icon',
  'simple-icons:pinecone': 'logos:pinecone-icon',
  'lucide:git-network': 'lucide:network',
  'lucide:api': 'lucide:webhook',
  'simple-icons:kafka': 'simple-icons:apachekafka',
  'simple-icons:intellij-idea': 'simple-icons:intellijidea',
};

export default function SpaceIcon({ iconKey, size = 20, style = {}, className = "" }) {
  const { theme } = useTheme();
  const [error, setError] = useState(false);

  // Reset error state if iconKey changes
  useEffect(() => {
    setError(false);
  }, [iconKey]);

  let rawKey = (iconKey || '').trim();
  const key = ICON_ALIASES[rawKey] || rawKey;

  // If empty key or error, use default folder icon
  if (!key || error) {
    return <RiFolder5Line size={size} style={{ color: 'inherit', flexShrink: 0, ...style }} className={className} />;
  }

  // Parse collection and name
  let collection = 'simple-icons';
  let name = key;

  if (key.includes(':')) {
    const parts = key.split(':');
    collection = parts[0];
    name = parts[1];
  } else {
    // Backwards-compatibility logic for legacy keys
    if (key === 'folder') {
      collection = 'lucide';
      name = 'folder';
    } else if (key === 'code' || key === 'terminal') {
      collection = 'lucide';
      name = 'terminal';
    }
  }

  // Load from cdn.simpleicons.org for colored brand icons
  // Load general concepts from api.iconify.design
  let src = '';
  if (collection === 'simple-icons') {
    src = `https://cdn.simpleicons.org/${name}`;
  } else {
    let colorQuery = '';
    if (collection === 'lucide') {
      const isLight = theme === 'light';
      // Use matching theme accents: Indigo #4f46e5 (light) and #6366f1 (dark)
      colorQuery = `?color=${isLight ? '%234f46e5' : '%236366f1'}`;
    }
    src = `https://api.iconify.design/${collection}/${name}.svg${colorQuery}`;
  }

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      style={{
        objectFit: 'contain',
        flexShrink: 0,
        ...style
      }}
      onError={() => setError(true)}
      className={className}
    />
  );
}
