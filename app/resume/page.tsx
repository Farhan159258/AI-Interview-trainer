'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getAuthToken } from '@/hooks/useAuth';
import type { ParsedResume } from '@/types';

export default function ResumeUploadPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParsedResume | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setError(null);
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large — max 5MB.');
      return;
    }

    setUploading(true);
    try {
      const token = await getAuthToken();
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to analyze resume');
      }
      const data = await res.json();
      setResult(data.resume);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setUploading(false);
    }
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-2xl font-semibold text-white">Upload your resume</h1>
      <p className="mt-1 text-sm text-white/50">
        We'll extract your skills and projects so interview questions are built around your real experience.
      </p>

      {!result && (
        <GlassPanel
          className={`mt-8 flex flex-col items-center justify-center gap-3 border-2 border-dashed p-14 text-center transition ${
            dragActive ? 'border-primary-500 bg-primary-500/5' : 'border-white/10'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) uploadFile(file);
          }}
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary-300" />
              <p className="text-sm text-white/60">Analyzing your resume…</p>
            </>
          ) : (
            <>
              <UploadCloud className="h-8 w-8 text-white/30" />
              <p className="text-sm text-white/70">Drag and drop your resume PDF here</p>
              <p className="text-xs text-white/30">or</p>
              <label>
                <span className="cursor-pointer rounded-lg border border-border bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">
                  Choose file
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file);
                  }}
                />
              </label>
              <p className="text-xs text-white/20">PDF only, up to 5MB</p>
            </>
          )}
        </GlassPanel>
      )}

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <GlassPanel className="mt-8 p-6">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Resume analyzed</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-white/60">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{result.fileName}</span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/70">{result.summary}</p>

            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-white/30">Skills detected</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {result.skills.map((s) => <Badge key={s}>{s}</Badge>)}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-white/30">Technologies</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {result.technologies.map((t) => <Badge key={t} tone="accent">{t}</Badge>)}
              </div>
            </div>

            {result.projects.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-white/30">Projects</p>
                <div className="mt-2 space-y-3">
                  {result.projects.map((p) => (
                    <div key={p.name} className="rounded-lg bg-white/5 p-3">
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      <p className="mt-1 text-xs text-white/50">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="mt-6 w-full"
              onClick={() => router.push(`/interview/new?resumeId=${result.id}`)}
            >
              Generate interview questions from this resume <ArrowRight className="h-4 w-4" />
            </Button>
          </GlassPanel>
        </motion.div>
      )}
    </div>
  );
}
