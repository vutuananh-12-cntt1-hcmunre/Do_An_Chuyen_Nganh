
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus, Search, RefreshCw, Eye, Pencil, Trash2, CheckCircle,
  XCircle, Package, Truck, FileText, X, Save, PlusCircle,
  ClipboardList, AlertCircle
} from "lucide-react";
import api from "../../services/api";

const STATUS = {
  DRAFT: { label: "Bản nháp", color: "bg-amber-100 text-amber-700" },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
};

const money = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " đ";

const dateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN");
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.detail ||
  error?.message ||
  "Đã xảy ra lỗi. Vui lòng thử lại.";

const newReceiptCode = () =>
  `PN-${Date.now().toString().slice(-10)}`;

const initialReceiptForm = {
  supplierId: "",
  employeeId: "",
  note: "",
};

const initialDetailForm = {
  ingredientId: "",
  quantity: "",
  unitPrice: "",
};

export default function PurchaseReceiptManagementPage() {
  const [receipts, setReceipts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [details, setDetails] = useState([]);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [receiptForm, setReceiptForm] = useState(initialReceiptForm);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [detailForm, setDetailForm] = useState(initialDetailForm);

  const loadReceipts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/purchase-receipts");
      setReceipts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDependencies = useCallback(async () => {
    try {
      const [supplierRes, ingredientRes] = await Promise.all([
        api.get("/suppliers"),
        api.get("/ingredients"),
      ]);

      setSuppliers(
        (Array.isArray(supplierRes.data) ? supplierRes.data : [])
          .filter((item) => item.isActive)
      );

      setIngredients(
        (Array.isArray(ingredientRes.data) ? ingredientRes.data : [])
          .filter((item) => item.isActive)
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    loadReceipts();
    loadDependencies();
  }, [loadReceipts, loadDependencies]);

  const loadDetails = async (receipt) => {
    try {
      setSelectedReceipt(receipt);
      setDetailLoading(true);
      setDetails([]);

      const response = await api.get(
        `/purchase-receipts/${receipt.receiptId}/details`
      );

      setDetails(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshSelectedReceipt = async (receiptId) => {
    const [receiptRes, detailRes] = await Promise.all([
      api.get(`/purchase-receipts/${receiptId}`),
      api.get(`/purchase-receipts/${receiptId}/details`),
    ]);

    setSelectedReceipt(receiptRes.data);
    setDetails(Array.isArray(detailRes.data) ? detailRes.data : []);
    await loadReceipts();
  };

  const filteredReceipts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return receipts.filter((receipt) => {
      const matchesSearch =
        !keyword ||
        receipt.receiptCode?.toLowerCase().includes(keyword) ||
        receipt.supplierName?.toLowerCase().includes(keyword) ||
        String(receipt.receiptId).includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" ||
        receipt.receiptStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [receipts, search, statusFilter]);

  const stats = useMemo(() => ({
    total: receipts.length,
    draft: receipts.filter((r) => r.receiptStatus === "DRAFT").length,
    confirmed: receipts.filter((r) => r.receiptStatus === "CONFIRMED").length,
    totalAmount: receipts
      .filter((r) => r.receiptStatus === "CONFIRMED")
      .reduce((sum, r) => sum + Number(r.totalAmount || 0), 0),
  }), [receipts]);

  const openCreateReceipt = () => {
    setEditingReceipt(null);
    setReceiptForm(initialReceiptForm);
    setShowReceiptModal(true);
  };

  const openEditReceipt = (receipt) => {
    setEditingReceipt(receipt);
    setReceiptForm({
      supplierId: String(receipt.supplierId || ""),
      employeeId: "",
      note: receipt.note || "",
    });
    setShowReceiptModal(true);
  };

  const saveReceipt = async (event) => {
    event.preventDefault();

    if (!receiptForm.supplierId) {
      alert("Vui lòng chọn nhà cung cấp.");
      return;
    }

    try {
      setSaving(true);

      if (editingReceipt) {
        await api.put(
          `/purchase-receipts/${editingReceipt.receiptId}`,
          {
            supplierId: Number(receiptForm.supplierId),
            note: receiptForm.note.trim(),
          }
        );

        alert("Cập nhật phiếu nhập thành công.");
        setShowReceiptModal(false);
        await loadReceipts();

        if (selectedReceipt?.receiptId === editingReceipt.receiptId) {
          await refreshSelectedReceipt(editingReceipt.receiptId);
        }
      } else {
        if (!receiptForm.employeeId || Number(receiptForm.employeeId) <= 0) {
          alert("Vui lòng nhập Employee ID hợp lệ.");
          return;
        }

        const response = await api.post("/purchase-receipts", {
          receiptCode: newReceiptCode(),
          supplierId: Number(receiptForm.supplierId),
          employeeId: Number(receiptForm.employeeId),
          note: receiptForm.note.trim(),
        });

        alert("Tạo phiếu nhập thành công.");
        setShowReceiptModal(false);
        await loadReceipts();

        if (response.data) {
          await loadDetails(response.data);
        }
      }
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmReceipt = async (receipt) => {
    if (!window.confirm(
      `Xác nhận phiếu ${receipt.receiptCode}?\nTồn kho nguyên liệu sẽ được cộng sau khi xác nhận.`
    )) return;

    try {
      setSaving(true);

      await api.patch(`/purchase-receipts/${receipt.receiptId}/confirm`);

      alert("Xác nhận phiếu nhập thành công. Tồn kho đã được cập nhật.");
      await loadReceipts();

      if (selectedReceipt?.receiptId === receipt.receiptId) {
        await refreshSelectedReceipt(receipt.receiptId);
      }
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const cancelReceipt = async (receipt) => {
    if (!window.confirm(`Bạn có chắc muốn hủy phiếu ${receipt.receiptCode}?`)) {
      return;
    }

    try {
      setSaving(true);

      await api.patch(`/purchase-receipts/${receipt.receiptId}/cancel`);

      alert("Đã hủy phiếu nhập.");
      setSelectedReceipt(null);
      setDetails([]);
      await loadReceipts();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const openAddDetail = () => {
    setEditingDetail(null);
    setDetailForm(initialDetailForm);
    setShowDetailModal(true);
  };

  const openEditDetail = (detail) => {
    setEditingDetail(detail);
    setDetailForm({
      ingredientId: String(detail.ingredientId),
      quantity: String(detail.quantity),
      unitPrice: String(detail.unitPrice),
    });
    setShowDetailModal(true);
  };

  const saveDetail = async (event) => {
    event.preventDefault();

    if (!selectedReceipt) return;

    const quantity = Number(detailForm.quantity);
    const unitPrice = Number(detailForm.unitPrice);

    if (!editingDetail && !detailForm.ingredientId) {
      alert("Vui lòng chọn nguyên liệu.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      alert("Số lượng phải lớn hơn 0.");
      return;
    }

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      alert("Đơn giá phải lớn hơn 0.");
      return;
    }

    try {
      setSaving(true);

      if (editingDetail) {
        await api.put(
          `/purchase-receipts/details/${editingDetail.receiptDetailId}`,
          { quantity, unitPrice }
        );
      } else {
        await api.post(
          `/purchase-receipts/${selectedReceipt.receiptId}/details`,
          {
            ingredientId: Number(detailForm.ingredientId),
            quantity,
            unitPrice,
          }
        );
      }

      setShowDetailModal(false);
      await refreshSelectedReceipt(selectedReceipt.receiptId);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteDetail = async (detail) => {
    if (!window.confirm(
      `Xóa nguyên liệu "${detail.ingredientName}" khỏi phiếu nhập?`
    )) return;

    try {
      setSaving(true);

      await api.delete(
        `/purchase-receipts/details/${detail.receiptDetailId}`
      );

      await refreshSelectedReceipt(selectedReceipt.receiptId);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const closeReceiptModal = () => {
    if (saving) return;
    setShowReceiptModal(false);
  };

  const closeDetailModal = () => {
    if (saving) return;
    setShowDetailModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý phiếu nhập kho
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý nhập nguyên liệu và cập nhật tồn kho
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              loadReceipts();
              loadDependencies();
            }}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            <RefreshCw size={16} /> Làm mới
          </button>

          <button
            onClick={openCreateReceipt}
            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            <Plus size={17} /> Tạo phiếu nhập
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Tổng phiếu nhập" value={stats.total} icon={<FileText />} />
        <StatCard title="Bản nháp" value={stats.draft} icon={<ClipboardList />} />
        <StatCard title="Đã xác nhận" value={stats.confirmed} icon={<CheckCircle />} />
        <StatCard title="Giá trị đã nhập" value={money(stats.totalAmount)} icon={<Package />} />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Receipt list */}
        <section className="overflow-hidden rounded-xl border bg-white xl:col-span-3">
          <div className="border-b p-4">
            <h2 className="font-semibold text-gray-800">Danh sách phiếu nhập</h2>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm mã phiếu, nhà cung cấp..."
                  className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-orange-500"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="DRAFT">Bản nháp</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : filteredReceipts.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <Package className="mx-auto mb-2 text-gray-300" size={36} />
              Chưa có phiếu nhập nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Mã phiếu</th>
                    <th className="px-4 py-3">Nhà cung cấp</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                    <th className="px-4 py-3">Tổng tiền</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredReceipts.map((receipt) => (
                    <tr
                      key={receipt.receiptId}
                      className={`hover:bg-orange-50 ${
                        selectedReceipt?.receiptId === receipt.receiptId
                          ? "bg-orange-50"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {receipt.receiptCode}
                      </td>
                      <td className="px-4 py-3">{receipt.supplierName}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {dateTime(receipt.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {money(receipt.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={receipt.receiptStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => loadDetails(receipt)}
                          title="Xem chi tiết"
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t px-4 py-3 text-xs text-gray-500">
            Hiển thị {filteredReceipts.length} / {receipts.length} phiếu nhập
          </div>
        </section>

        {/* Receipt details */}
        <section className="overflow-hidden rounded-xl border bg-white xl:col-span-2">
          {!selectedReceipt ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center text-gray-400">
              <ClipboardList size={44} className="mb-3" />
              <p className="font-medium">Chưa chọn phiếu nhập</p>
              <p className="mt-1 text-sm">
                Chọn một phiếu để xem danh sách nguyên liệu
              </p>
            </div>
          ) : (
            <>
              <div className="border-b p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-gray-800">
                      {selectedReceipt.receiptCode}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedReceipt.supplierName}
                    </p>
                  </div>
                  <StatusBadge status={selectedReceipt.receiptStatus} />
                </div>

                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  <p>Ngày tạo: {dateTime(selectedReceipt.createdAt)}</p>
                  <p>Ngày xác nhận: {dateTime(selectedReceipt.confirmedAt)}</p>
                  {selectedReceipt.note && (
                    <p>Ghi chú: {selectedReceipt.note}</p>
                  )}
                </div>

                {selectedReceipt.receiptStatus === "DRAFT" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => openEditReceipt(selectedReceipt)}
                      className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs hover:bg-gray-50"
                    >
                      <Pencil size={14} /> Sửa phiếu
                    </button>
                    <button
                      onClick={openAddDetail}
                      className="flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-2 text-xs text-white hover:bg-orange-700"
                    >
                      <Plus size={14} /> Thêm nguyên liệu
                    </button>
                    <button
                      onClick={() => confirmReceipt(selectedReceipt)}
                      disabled={saving || details.length === 0}
                      className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle size={14} /> Xác nhận nhập
                    </button>
                    <button
                      onClick={() => cancelReceipt(selectedReceipt)}
                      disabled={saving}
                      className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      <XCircle size={14} /> Hủy phiếu
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="mb-3 font-semibold text-gray-700">
                  Nguyên liệu trong phiếu
                </h3>

                {detailLoading ? (
                  <p className="py-8 text-center text-sm text-gray-500">
                    Đang tải chi tiết...
                  </p>
                ) : details.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400">
                    Phiếu chưa có nguyên liệu.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {details.map((detail) => (
                      <div
                        key={detail.receiptDetailId}
                        className="rounded-lg border p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-gray-800">
                            {detail.ingredientName}
                          </div>

                          {selectedReceipt.receiptStatus === "DRAFT" && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => openEditDetail(detail)}
                                className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                                title="Sửa"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => deleteDetail(detail)}
                                className="rounded p-1.5 text-red-600 hover:bg-red-50"
                                title="Xóa"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <p>Số lượng: <b className="text-gray-700">{detail.quantity} {detail.unit}</b></p>
                          <p>Đơn giá: <b className="text-gray-700">{money(detail.unitPrice)}</b></p>
                        </div>

                        <div className="mt-2 border-t pt-2 text-right text-sm font-semibold text-orange-700">
                          {money(detail.subtotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <span className="font-semibold text-gray-700">Tổng cộng</span>
                  <span className="text-lg font-bold text-orange-700">
                    {money(selectedReceipt.totalAmount)}
                  </span>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Receipt modal */}
      {showReceiptModal && (
        <Modal
          title={editingReceipt ? "Cập nhật phiếu nhập" : "Tạo phiếu nhập mới"}
          onClose={closeReceiptModal}
        >
          <form onSubmit={saveReceipt} className="space-y-4">
            {!editingReceipt && (
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                Mã phiếu sẽ được hệ thống tự động tạo: {newReceiptCode()}
              </div>
            )}

            <FormField label="Nhà cung cấp">
              <select
                required
                value={receiptForm.supplierId}
                onChange={(e) => setReceiptForm({
                  ...receiptForm,
                  supplierId: e.target.value,
                })}
                className="form-input"
              >
                <option value="">-- Chọn nhà cung cấp --</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.supplierId} value={supplier.supplierId}>
                    {supplier.supplierCode} - {supplier.supplierName}
                  </option>
                ))}
              </select>
            </FormField>

            {!editingReceipt && (
              <FormField label="Mã nhân viên (Employee ID)">
                <input
                  type="number"
                  min="1"
                  required
                  value={receiptForm.employeeId}
                  onChange={(e) => setReceiptForm({
                    ...receiptForm,
                    employeeId: e.target.value,
                  })}
                  placeholder="Nhập employeeId của nhân viên lập phiếu"
                  className="form-input"
                />
              </FormField>
            )}

            <FormField label="Ghi chú">
              <textarea
                rows="3"
                value={receiptForm.note}
                onChange={(e) => setReceiptForm({
                  ...receiptForm,
                  note: e.target.value,
                })}
                placeholder="Ghi chú phiếu nhập..."
                className="form-input"
              />
            </FormField>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeReceiptModal}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Đang lưu..." : "Lưu phiếu"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Detail modal */}
      {showDetailModal && (
        <Modal
          title={editingDetail ? "Cập nhật nguyên liệu" : "Thêm nguyên liệu"}
          onClose={closeDetailModal}
        >
          <form onSubmit={saveDetail} className="space-y-4">
            {!editingDetail && (
              <FormField label="Nguyên liệu">
                <select
                  required
                  value={detailForm.ingredientId}
                  onChange={(e) => setDetailForm({
                    ...detailForm,
                    ingredientId: e.target.value,
                  })}
                  className="form-input"
                >
                  <option value="">-- Chọn nguyên liệu --</option>
                  {ingredients
                    .filter((ingredient) =>
                      !details.some(
                        (detail) => detail.ingredientId === ingredient.ingredientId
                      )
                    )
                    .map((ingredient) => (
                      <option
                        key={ingredient.ingredientId}
                        value={ingredient.ingredientId}
                      >
                        {ingredient.ingredientCode} - {ingredient.ingredientName} ({ingredient.unit})
                      </option>
                    ))}
                </select>
              </FormField>
            )}

            {editingDetail && (
              <div className="rounded-lg bg-gray-50 p-3 text-sm">
                Nguyên liệu: <b>{editingDetail.ingredientName}</b>
              </div>
            )}

            <FormField label="Số lượng nhập">
              <input
                type="number"
                min="0.001"
                step="0.001"
                required
                value={detailForm.quantity}
                onChange={(e) => setDetailForm({
                  ...detailForm,
                  quantity: e.target.value,
                })}
                className="form-input"
                placeholder="Ví dụ: 10"
              />
            </FormField>

            <FormField label="Đơn giá (VNĐ)">
              <input
                type="number"
                min="1"
                step="1"
                required
                value={detailForm.unitPrice}
                onChange={(e) => setDetailForm({
                  ...detailForm,
                  unitPrice: e.target.value,
                })}
                className="form-input"
                placeholder="Ví dụ: 50000"
              />
            </FormField>

            <div className="rounded-lg bg-orange-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Thành tiền dự kiến</span>
                <b className="text-orange-700">
                  {money(Number(detailForm.quantity || 0) * Number(detailForm.unitPrice || 0))}
                </b>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeDetailModal}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Đang lưu..." : "Lưu nguyên liệu"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-white p-4">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-1 text-xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
        {icon}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = STATUS[status] || {
    label: status || "Không xác định",
    color: "bg-gray-100 text-gray-600",
  };

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

function FormField({ label, children }) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-gray-700">
      {label}
      {children}
    </label>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
