interface MockControlsPanelProps {
  onCoverOpen: () => void;
  onDisconnect: () => void;
  onOverheat: () => void;
  onPaperOut: () => void;
  onResetHealth: () => void;
}

export function MockControlsPanel({
  onCoverOpen,
  onDisconnect,
  onOverheat,
  onPaperOut,
  onResetHealth,
}: MockControlsPanelProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Error Simulation</h2>
      </div>
      <div className="button-stack">
        <button type="button" onClick={onPaperOut}>
          Paper Out
        </button>
        <button type="button" onClick={onCoverOpen}>
          Cover Open
        </button>
        <button type="button" onClick={onOverheat}>
          Overheat
        </button>
        <button type="button" onClick={onResetHealth}>
          Reset Health
        </button>
        <button type="button" onClick={onDisconnect}>
          Simulate Disconnect
        </button>
      </div>
    </section>
  );
}
