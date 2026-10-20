import React, { useState, useEffect } from 'react';
import {
  Brain, Database, BarChart2, Download, Trash2,
  RefreshCw, CheckCircle, AlertCircle, Info, TrendingUp
} from 'lucide-react';
import { DatasetService } from '../services/datasetService';
import { MLModelService } from '../services/mlModelService';
import type { DatasetStats, TrainingResult } from '../types/dataset';
import { EMOTION_LABELS } from '../types/dataset';
import type { EmotionType } from '../types';

const EMOTION_COLORS: Record<EmotionType, string> = {
  calm:        '#34d399',
  sadness:     '#60a5fa',
  frustration: '#f87171',
  excitement:  '#fbbf24',
  overwhelmed: '#c084fc',
  anxious:     '#fb923c',
  tired:       '#94a3b8',
  neutral:     '#6b7280',
};

interface Props {
  onDatasetUpdated?: () => void;
}

export const DatasetInsightsPanel: React.FC<Props> = ({ onDatasetUpdated }) => {
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(null);
  const [trainingEpoch, setTrainingEpoch] = useState<number>(0);
  const [trainingAcc, setTrainingAcc] = useState<number>(0);
  const [trainingError, setTrainingError] = useState<string | null>(null);

  const refresh = () => setStats(DatasetService.getStats());

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTrain = async () => {
    setIsTraining(true);
    setTrainingResult(null);
    setTrainingError(null);
    setTrainingEpoch(0);
    setTrainingAcc(0);

    try {
      const result = await MLModelService.train((epoch, logs) => {
        setTrainingEpoch(epoch + 1);
        setTrainingAcc(((logs['acc'] as number) ?? 0) * 100);
      });

      if (result) {
        setTrainingResult(result);
        refresh();
        onDatasetUpdated?.();
      } else {
        setTrainingError(`Need at least 10 labelled samples to train. You have ${stats?.total ?? 0}.`);
      }
    } catch (err) {
      setTrainingError(err instanceof Error ? err.message : 'Training failed');
    } finally {
      setIsTraining(false);
    }
  };

  const handleClearDataset = () => {
    if (!window.confirm('Clear all training data and model weights? This cannot be undone.')) return;
    DatasetService.clearAll();
    MLModelService.deleteModel();
    setTrainingResult(null);
    setTrainingError(null);
    refresh();
    onDatasetUpdated?.();
  };

  if (!stats) return null;

  const maxEmotionCount = Math.max(1, ...Object.values(stats.byEmotion));

  return (
    <div
      id="dataset-insights-panel"
      style={{
        marginTop: '1.5rem',
        borderRadius: '16px',
        border: '1px solid rgba(167, 139, 250, 0.25)',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(11, 15, 23, 0.9) 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded((p) => !p)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.2rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#f8fafc',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Brain size={18} color="#a78bfa" />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Training Dataset & ML Model</span>
          {stats.total > 0 && (
            <span style={{
              padding: '2px 8px', borderRadius: '999px', fontSize: '0.72rem',
              background: 'rgba(167, 139, 250, 0.15)', color: '#c4b5fd',
              border: '1px solid rgba(167, 139, 250, 0.25)',
            }}>
              {stats.total} samples
            </span>
          )}
          {stats.mlModelAccuracy !== null && (
            <span style={{
              padding: '2px 8px', borderRadius: '999px', fontSize: '0.72rem',
              background: 'rgba(52, 211, 153, 0.12)', color: '#34d399',
              border: '1px solid rgba(52, 211, 153, 0.25)',
            }}>
              Model {(stats.mlModelAccuracy * 100).toFixed(0)}% acc
            </span>
          )}
        </div>
        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{isExpanded ? '▲ hide' : '▼ show'}</span>
      </button>

      {isExpanded && (
        <div style={{ padding: '0 1.2rem 1.2rem' }}>
          {/* How it works */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
            padding: '0.65rem 0.9rem', borderRadius: '10px',
            background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.15)',
            marginBottom: '1rem', fontSize: '0.78rem', color: '#7dd3fc',
          }}>
            <Info size={14} style={{ marginTop: '1px', flexShrink: 0 }} />
            <span>
              Every time you <strong>confirm or correct</strong> an emotion, the acoustic features and label are saved here.
              Once you have <strong>10+ samples</strong>, click <strong>Train Model</strong> to teach a neural network
              your personal patterns — improving future emotion estimates and recommendations automatically.
            </span>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            {[
              { icon: <Database size={15} />, label: 'Total Samples', value: stats.total, color: '#a78bfa' },
              {
                icon: <CheckCircle size={15} />, label: 'Rule-based Accuracy',
                value: stats.total > 0 ? `${(stats.modelAccuracy * 100).toFixed(0)}%` : '—', color: '#34d399'
              },
              {
                icon: <TrendingUp size={15} />, label: 'ML Accuracy',
                value: stats.mlModelAccuracy !== null ? `${(stats.mlModelAccuracy * 100).toFixed(0)}%` : 'Not trained', color: '#fbbf24'
              },
            ].map((s) => (
              <div key={s.label} style={{
                padding: '0.7rem', borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'center',
              }}>
                <div style={{ color: s.color, marginBottom: '0.3rem' }}>{s.icon}</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>{s.value}</div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Emotion Distribution Bar Chart */}
          {stats.total > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>
                <BarChart2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                LABEL DISTRIBUTION
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {EMOTION_LABELS.map((emotion) => {
                  const count = stats.byEmotion[emotion as EmotionType] ?? 0;
                  const pct = (count / maxEmotionCount) * 100;
                  const color = EMOTION_COLORS[emotion as EmotionType];
                  return (
                    <div key={emotion} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '80px', fontSize: '0.72rem', color: '#94a3b8', textAlign: 'right', flexShrink: 0, textTransform: 'capitalize' }}>
                        {emotion}
                      </span>
                      <div style={{ flex: 1, height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`, height: '100%',
                          background: color, borderRadius: '6px',
                          transition: 'width 0.4s ease',
                          opacity: count === 0 ? 0.2 : 1,
                          minWidth: count > 0 ? '8px' : '0',
                        }} />
                      </div>
                      <span style={{ width: '24px', fontSize: '0.72rem', color: '#64748b' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Training Section */}
          <div style={{ marginBottom: '0.75rem' }}>
            {/* Train button */}
            <button
              id="train-model-btn"
              onClick={handleTrain}
              disabled={isTraining || stats.total < 10}
              style={{
                width: '100%', padding: '0.65rem', borderRadius: '10px',
                background: isTraining ? 'rgba(139, 92, 246, 0.2)' : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                color: '#fff', fontWeight: 600, fontSize: '0.85rem',
                cursor: isTraining || stats.total < 10 ? 'not-allowed' : 'pointer',
                opacity: stats.total < 10 ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.2s',
              }}
            >
              {isTraining ? (
                <>
                  <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  Training… Epoch {trainingEpoch} ({trainingAcc.toFixed(0)}% acc)
                </>
              ) : (
                <>
                  <Brain size={15} />
                  {stats.total < 10
                    ? `Train Model (need ${10 - stats.total} more samples)`
                    : `Train Model on ${stats.total} Samples`}
                </>
              )}
            </button>

            {/* Training progress bar */}
            {isTraining && (
              <div style={{ marginTop: '0.5rem', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', background: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
                  width: `${trainingAcc}%`, transition: 'width 0.3s ease',
                }} />
              </div>
            )}

            {/* Training result */}
            {trainingResult && !isTraining && (
              <div style={{
                marginTop: '0.6rem', padding: '0.65rem 0.9rem', borderRadius: '10px',
                background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.2)',
                fontSize: '0.78rem', color: '#6ee7b7',
              }}>
                ✅ Training complete in {(trainingResult.durationMs / 1000).toFixed(1)}s —
                Train accuracy: <strong>{(trainingResult.finalAccuracy * 100).toFixed(1)}%</strong>
                {trainingResult.valAccuracy > 0 && (
                  <> · Val accuracy: <strong>{(trainingResult.valAccuracy * 100).toFixed(1)}%</strong></>
                )}
                <br />
                <span style={{ color: '#94a3b8' }}>
                  The ML model will now blend with the rule-based estimator to give you better recommendations.
                </span>
              </div>
            )}

            {/* Training error */}
            {trainingError && (
              <div style={{
                marginTop: '0.6rem', padding: '0.6rem 0.9rem', borderRadius: '10px',
                background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.2)',
                fontSize: '0.78rem', color: '#fca5a5', display: 'flex', gap: '0.4rem', alignItems: 'flex-start',
              }}>
                <AlertCircle size={13} style={{ marginTop: '2px', flexShrink: 0 }} />
                {trainingError}
              </div>
            )}
          </div>

          {/* Export / Clear buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              id="export-json-btn"
              onClick={() => DatasetService.exportJSON()}
              disabled={stats.total === 0}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: '8px', fontSize: '0.78rem',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8', cursor: stats.total === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                opacity: stats.total === 0 ? 0.5 : 1,
              }}
            >
              <Download size={12} /> Export JSON
            </button>
            <button
              id="export-csv-btn"
              onClick={() => DatasetService.exportCSV()}
              disabled={stats.total === 0}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: '8px', fontSize: '0.78rem',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8', cursor: stats.total === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                opacity: stats.total === 0 ? 0.5 : 1,
              }}
            >
              <Download size={12} /> Export CSV
            </button>
            <button
              id="clear-dataset-btn"
              onClick={handleClearDataset}
              disabled={stats.total === 0}
              style={{
                padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem',
                background: 'rgba(248, 113, 113, 0.06)', border: '1px solid rgba(248, 113, 113, 0.2)',
                color: '#f87171', cursor: stats.total === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                opacity: stats.total === 0 ? 0.5 : 1,
              }}
            >
              <Trash2 size={12} /> Clear
            </button>
          </div>

          {stats.lastTrainedAt && (
            <p style={{ fontSize: '0.68rem', color: '#475569', marginTop: '0.6rem', textAlign: 'center' }}>
              Last trained: {new Date(stats.lastTrainedAt).toLocaleString()} · {stats.trainedEpochs} epochs
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
