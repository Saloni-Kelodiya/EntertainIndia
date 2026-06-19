"use client";
import { useState } from 'react';
import { SOCIAL_SHARE } from '../../lib/constants';
import { copyToClipboard } from '../../lib/helpers';
import { Facebook, Twitter, Linkedin, Link as LinkIcon, Check, MessageCircle } from "lucide-react";

export default function ShareBar({ url, title }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareButtons = [
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      url: SOCIAL_SHARE.facebook(url),
      bg: 'hover:bg-blue-600 hover:text-white',
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      url: SOCIAL_SHARE.twitter(url, title),
      bg: 'hover:bg-sky-500 hover:text-white',
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5" />,
      url: SOCIAL_SHARE.whatsapp(url, title),
      bg: 'hover:bg-green-600 hover:text-white',
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5" />,
      url: SOCIAL_SHARE.linkedin(url),
      bg: 'hover:bg-blue-700 hover:text-white',
    },
  ];

  return (
    <div className="flex items-center gap-3 flex-wrap mt-4">

      {/* Main pill container */}
      <div className="flex items-center gap-2 bg-gray-400 dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">

        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Share:
        </span>

        {shareButtons.map((btn) => (
          <a
            key={btn.name}
            href={btn.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-gray-900
                       border border-gray-200 dark:border-gray-700 
                       transition-all duration-200 ${btn.bg}`}
            title={`Share on ${btn.name}`}
          >
            {btn.icon}
          </a>
        ))}

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-gray-900
                     border border-gray-200 dark:border-gray-700 hover:bg-gray-600 
                     hover:text-white transition-colors duration-200"
          title="Copy link"
        >
          {copied ? <Check className="w-5 h-5 text-green-500" /> : <LinkIcon className="w-5 h-5" />}
        </button>

      </div>

      {/* Copied Text */}
      {copied && (
        <span className="text-sm text-green-600 font-medium ml-2">
          Link copied!
        </span>
      )}

    </div>
  );
}
