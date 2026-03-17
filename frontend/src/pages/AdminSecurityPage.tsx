import { useCallback, useEffect, useMemo, useState } from "react";
import {
  backupMasterKeys,
  createMasterKey,
  getAuditLogs,
  getMasterKeys,
  reindexSearch
} from "../api";
import type { AuditLog, MasterKeyBackup, MasterKeySummary } from "../types";

type AdminSecurityPageProps = {
  onStatusChange?: (status: string) => void;
};

export default function AdminSecurityPage({ onStatusChange }: AdminSecurityPageProps) {
  const [keys, setKeys] = useState<MasterKeySummary[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [storageLocation, setStorageLocation] = useState("demo-vault");
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupData, setBackupData] = useState<MasterKeyBackup[] | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logStatus, setLogStatus] = useState("");
  const [logLoading, setLogLoading] = useState(false);
  const [reindexLoading, setReindexLoading] = useState(false);
  const logPreviewLimit = 10;

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const formatDateTime = (value?: string | null) => {
    if (!value) {
      return "-";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }
    return date.toLocaleString();
  };

  const loadKeys = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMasterKeys();
      setKeys(data);
      setStatus(data.length === 0 ? "Chưa có master key." : "");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Không thể tải danh sách khóa.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);
  const loadLogs = useCallback(async () => {
    setLogLoading(true);
    try {
      const data = await getAuditLogs(50);
      setAuditLogs(data);
      setLogStatus(data.length === 0 ? "Chưa có log." : "");
    } catch (err) {
      setLogStatus(err instanceof Error ? err.message : "Không thể tải nhật ký.");
    } finally {
      setLogLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleReindex = async () => {
    if (!window.confirm("Bạn có chắc muốn tái lập chỉ mục tìm kiếm?")) {
      setStatus("Đã hủy tái lập chỉ mục.");
      return;
    }
    setReindexLoading(true);
    setStatus("Đang tái lập chỉ mục...");
    try {
      const result = await reindexSearch();
      const normalizedStatus = (result.status || "").toUpperCase();
      if (normalizedStatus === "OK" || normalizedStatus === "SPARK_OK") {
        setStatus("Tái lập chỉ mục thành công.");
      } else if (normalizedStatus === "SKIPPED") {
        setStatus("Tái lập chỉ mục bị bỏ qua (tìm kiếm đang tắt).");
      } else {
        setStatus("Tái lập chỉ mục thất bại.");
      }
      loadLogs();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Tái lập chỉ mục thất bại.");
    } finally {
      setReindexLoading(false);
    }
  };

  const handleCreate = async (label: string) => {
    if (!storageLocation.trim()) {
      setStatus("Vui lòng nhập vị trí lưu khóa.");
      return;
    }
    setLoading(true);
    setStatus(`${label}...`);
    try {
      await createMasterKey(storageLocation.trim());
      setStatus(`${label} thành công.`);
      await loadKeys();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Thao tác thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn sao lưu master key?")) {
      setStatus("Đã hủy sao lưu.");
      return;
    }
    setLoading(true);
    setStatus("Đang sao lưu master key...");
    try {
      const data = await backupMasterKeys();
      setBackupData(data);
      setShowBackupModal(true);
      setStatus("Sao lưu master key thành công.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Sao lưu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const backupJson = useMemo(
    () => (backupData ? JSON.stringify(backupData, null, 2) : ""),
    [backupData]
  );

  return (
    <div className="page">
      <section className="panel manage-section">
        <div className="section-head">
          <div>
            <h3>Quản trị bảo mật & khóa</h3>
            <p className="subtle">Quản lý master key phục vụ mã hóa/giải mã.</p>
          </div>
          <span className="chip">Master Key</span>
        </div>

        <div className="form-grid">
          <label>
            Vị trí lưu khóa
            <input
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value)}
              placeholder="demo-vault"
            />
          </label>
          <div className="action-row">
            <button className="primary" type="button" onClick={() => handleCreate("Tạo khóa")}>
              Tạo khóa
            </button>
            <button className="ghost" type="button" onClick={() => handleCreate("Cập nhật khóa")}>
              Cập nhật khóa
            </button>
            <button className="ghost" type="button" onClick={handleBackup}>
              Sao lưu khóa
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="audit-log-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
                <th>Kho</th>
              </tr>
            </thead>
            <tbody>
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty">
                    {loading ? "Đang tải..." : "Chưa có master key."}
                  </td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr key={key.id}>
                    <td>#{key.id}</td>
                    <td>{key.type}</td>
                    <td>{key.status}</td>
                    <td>{formatDateTime(key.createdAt)}</td>
                    <td>{key.vaultLocation || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
            </section>

      <section className="panel manage-section">
        <div className="section-head">
          <div>
            <h3>Chỉ mục tìm kiếm</h3>
            <p className="subtle">Đồng bộ metadata sang chỉ mục tìm kiếm để tra cứu nhanh.</p>
          </div>
          <span className="chip">Tìm kiếm</span>
        </div>
        <div className="action-row">
          <button
            className="primary"
            type="button"
            onClick={handleReindex}
            disabled={reindexLoading}
          >
            {reindexLoading ? "Đang tái lập chỉ mục..." : "Tái lập chỉ mục"}
          </button>
          {status ? <div className="status">{status}</div> : null}
        </div>
      </section>

      <section className="panel manage-section">
        <div className="section-head">
          <div>
            <h3>Nhật ký truy cập</h3>
            <p className="subtle">Ghi log truy cập API và các hoạt động quan trọng.</p>
          </div>
          <span className="chip">Nhật ký</span>
        </div>
        <div className="action-row">
          <button
            className="ghost"
            type="button"
            onClick={loadLogs}
            disabled={logLoading}
          >
            {logLoading ? "Đang tải..." : "Làm mới"}
          </button>
          {logStatus ? <div className="status">{logStatus}</div> : null}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Phương thức</th>
                <th>Đường dẫn</th>
                <th>Trạng thái</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    {logLoading ? "Đang tải..." : "Chưa có log."}
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDateTime(log.createdAt)}</td>
                    <td>{log.username || "-"}</td>
                    <td>{log.role || "-"}</td>
                    <td>{log.method}</td>
                    <td title={log.userAgent || ""}>{log.path}</td>
                    <td>{log.statusCode}</td>
                    <td>{log.clientIp || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showBackupModal ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h3>Sao lưu master key</h3>
                <p className="subtle">Lưu trữ thông tin này ở nơi an toàn.</p>
              </div>
            </div>
            <div className="backup-box">
              <pre>{backupJson}</pre>
            </div>
            <div className="modal-actions">
              <button className="ghost" type="button" onClick={() => setShowBackupModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


