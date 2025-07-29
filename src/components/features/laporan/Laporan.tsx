"use client";

import React, { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";

const bulanOptions = [
  "",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function GenerateLaporanPage() {
  const [tahun, setTahun] = useState("2024");
  const [bulan, setBulan] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [shouldGenerate, setShouldGenerate] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const {
    data: laporanData,
    isLoading: loading,
    error,
  } = trpc.pembayaran.generateLaporan.useQuery(
    {
      tahun,
      bulan: bulan || undefined,
      kelasId: kelasId || undefined,
    },
    {
      enabled: shouldGenerate,
      refetchOnWindowFocus: false,
    }
  );

  const { data: kelasData } = trpc.kelas.getAll.useQuery();

  const handleGenerate = () => {
    setShouldGenerate(true);
  };

  const formatCurrency = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  const formatTanggal = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (printRef.current) {
      const element = printRef.current;

      try {
        const [html2canvasPro, jsPDF] = await Promise.all([
          import("html2canvas-pro"),
          import("jspdf"),
        ]);

        const canvas = await html2canvasPro.default(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: "#ffffff",
          ignoreElements: (element) => {
            return element.classList?.contains("no-pdf");
          },
        });

        const pdf = new jsPDF.jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const canvasAspectRatio = canvas.height / canvas.width;
        const pdfAspectRatio = pdfHeight / pdfWidth;

        let finalWidth, finalHeight;

        if (canvasAspectRatio > pdfAspectRatio) {
          finalHeight = pdfHeight - 20;
          finalWidth = finalHeight / canvasAspectRatio;
        } else {
          finalWidth = pdfWidth - 20;
          finalHeight = finalWidth * canvasAspectRatio;
        }

        const xOffset = (pdfWidth - finalWidth) / 2;
        const yOffset = (pdfHeight - finalHeight) / 2;

        pdf.addImage(
          imgData,
          "JPEG",
          xOffset,
          yOffset,
          finalWidth,
          finalHeight
        );

        // Save PDF
        const filename = `laporan-spp-${tahun}${
          bulan ? `-${bulan.toLowerCase()}` : ""
        }.pdf`;
        pdf.save(filename);
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert(
          "Gagal membuat PDF. Pastikan browser mendukung fitur ini dan coba lagi."
        );
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.headerCard}>
          <div style={styles.headerContent}>
            <div>
              <h1 style={styles.title}>Laporan Pembayaran SPP</h1>
              <p style={styles.subtitle}>
                Generate dan export laporan pembayaran siswa
              </p>
            </div>
            <div style={styles.iconContainer}>
              <div style={styles.iconWrapper}>
                <svg
                  style={styles.icon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div style={styles.filterGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <svg
                  style={styles.labelIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Tahun
              </label>
              <select
                style={styles.select}
                value={tahun}
                onChange={(e) => {
                  setTahun(e.target.value);
                  setShouldGenerate(false);
                }}
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <svg
                  style={styles.labelIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Bulan
              </label>
              <select
                style={styles.select}
                value={bulan}
                onChange={(e) => {
                  setBulan(e.target.value);
                  setShouldGenerate(false);
                }}
              >
                {bulanOptions.map((b) => (
                  <option key={b} value={b}>
                    {b || "Semua Bulan"}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <svg
                  style={styles.labelIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Kelas
              </label>
              <select
                style={styles.select}
                value={kelasId}
                onChange={(e) => {
                  setKelasId(e.target.value);
                  setShouldGenerate(false);
                }}
              >
                <option value="">Semua Kelas</option>
                {kelasData?.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kelas}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.buttonContainer}>
              <button
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  ...styles.generateButton,
                  ...(loading ? styles.buttonDisabled : {}),
                }}
              >
                {loading ? (
                  <>
                    <svg
                      style={styles.loadingIcon}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        style={styles.loadingCircle}
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        style={styles.loadingPath}
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg
                      style={styles.buttonIcon}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorMessage}>
              <svg
                style={styles.errorIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span style={styles.errorText}>Error:</span> {error.message}
            </div>
          )}
        </div>

        {laporanData && (
          <div style={styles.reportCard}>
            <div style={styles.actionBar}>
              <div>
                <h3 style={styles.reportTitle}>
                  📊 Laporan SPP {tahun} {bulan && `- ${bulan}`}
                </h3>
                <p style={styles.reportDate}>
                  Generated pada{" "}
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div style={styles.actionButtons}>
                <button onClick={handlePrint} style={styles.printButton}>
                  <svg
                    style={styles.buttonIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print
                </button>
                <button onClick={handleExportPDF} style={styles.pdfButton}>
                  <svg
                    style={styles.buttonIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export PDF
                </button>
              </div>
            </div>

            <div ref={printRef} style={styles.printableArea}>
              <div style={styles.summaryGrid}>
                <div style={styles.summaryCardBlue}>
                  <div style={styles.summaryCardContent}>
                    <div>
                      <p style={styles.summaryLabel}>Total Pembayaran</p>
                      <p style={styles.summaryValueBlue}>
                        {formatCurrency(laporanData.summary.totalPembayaran)}
                      </p>
                    </div>
                    <div style={styles.summaryIconBlue}>
                      <svg
                        style={styles.summaryIconSvg}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div style={styles.summaryCardGreen}>
                  <div style={styles.summaryCardContent}>
                    <div>
                      <p style={styles.summaryLabel}>Total Transaksi</p>
                      <p style={styles.summaryValueGreen}>
                        {laporanData.summary.totalTransaksi.toLocaleString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                    <div style={styles.summaryIconGreen}>
                      <svg
                        style={styles.summaryIconSvg}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div style={styles.summaryCardPurple}>
                  <div style={styles.summaryCardContent}>
                    <div>
                      <p style={styles.summaryLabel}>Jumlah Kelas</p>
                      <p style={styles.summaryValuePurple}>
                        {Object.keys(laporanData.summary.summaryByKelas).length}
                      </p>
                    </div>
                    <div style={styles.summaryIconPurple}>
                      <svg
                        style={styles.summaryIconSvg}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.tableSection}>
                <h4 style={styles.sectionTitle}>
                  <svg
                    style={styles.sectionIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Ringkasan per Kelas
                </h4>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeaderBlue}>
                      <tr>
                        <th style={styles.tableHeaderCell}>Kelas</th>
                        <th style={styles.tableHeaderCellRight}>Transaksi</th>
                        <th style={styles.tableHeaderCellRight}>
                          Total Pembayaran
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(laporanData.summary.summaryByKelas).map(
                        ([kelas, data], index) => (
                          <tr
                            key={kelas}
                            style={
                              index % 2 === 0
                                ? styles.tableRowEven
                                : styles.tableRowOdd
                            }
                          >
                            <td style={styles.tableCell}>{kelas}</td>
                            <td style={styles.tableCellRight}>
                              <span style={styles.badge}>{data.count}</span>
                            </td>
                            <td style={styles.tableCellRightBold}>
                              {formatCurrency(data.total)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={styles.tableSection}>
                <h4 style={styles.sectionTitle}>
                  <svg
                    style={styles.sectionIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Detail Transaksi ({laporanData.pembayaran.length} transaksi)
                </h4>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeaderGreen}>
                      <tr>
                        <th style={styles.tableHeaderCellCenter}>No</th>
                        <th style={styles.tableHeaderCell}>Tanggal</th>
                        <th style={styles.tableHeaderCell}>NIS</th>
                        <th style={styles.tableHeaderCell}>Nama Siswa</th>
                        <th style={styles.tableHeaderCell}>Kelas</th>
                        <th style={styles.tableHeaderCell}>Periode</th>
                        <th style={styles.tableHeaderCellRight}>Jumlah</th>
                        <th style={styles.tableHeaderCell}>Petugas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {laporanData.pembayaran.map((d, i) => (
                        <tr
                          key={d.id}
                          style={
                            i % 2 === 0
                              ? styles.tableRowEven
                              : styles.tableRowOdd
                          }
                        >
                          <td style={styles.tableCellCenter}>{i + 1}</td>
                          <td style={styles.tableCell}>
                            {formatTanggal(d.tgl_bayar)}
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.badgeBlue}>{d.siswa.nis}</span>
                          </td>
                          <td style={styles.tableCellBold}>{d.siswa.nama}</td>
                          <td style={styles.tableCell}>
                            <span style={styles.badgePurple}>
                              {d.siswa.kelas?.nama_kelas || "Tanpa Kelas"}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            {d.bulan_bayar} {d.tahun_bayar}
                          </td>
                          <td style={styles.tableCellRightGreen}>
                            {formatCurrency(d.jumlah_bayar)}
                          </td>
                          <td style={styles.tableCell}>
                            {d.petugas.nama_petugas}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media print {
          body * {
            visibility: hidden;
          }

          [data-print="true"],
          [data-print="true"] * {
            visibility: visible;
          }

          [data-print="true"] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          .no-print {
            display: none !important;
          }

          table {
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          thead {
            display: table-header-group;
          }

          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #e0f2fe 100%)",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  content: {
    padding: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
  },
  headerCard: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    backdropFilter: "blur(10px)",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  title: {
    fontSize: "30px",
    fontWeight: "bold",
    background: "linear-gradient(45deg, #2563eb, #7c3aed)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: 0,
  },
  subtitle: {
    color: "#6b7280",
    marginTop: "4px",
    margin: 0,
  },
  iconContainer: {
    display: "block",
  },
  iconWrapper: {
    width: "64px",
    height: "64px",
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  icon: {
    width: "32px",
    height: "32px",
    color: "white",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  labelIcon: {
    width: "16px",
    height: "16px",
    color: "#3b82f6",
  },
  select: {
    width: "100%",
    border: "1px solid #d1d5db",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "white",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    transition: "all 0.2s",
    outline: "none",
  },
  buttonContainer: {
    display: "flex",
    alignItems: "flex-end",
  },
  generateButton: {
    background: "linear-gradient(45deg, #2563eb, #1d4ed8)",
    color: "white",
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    justifyContent: "center",
  },
  buttonDisabled: {
    background: "linear-gradient(45deg, #9ca3af, #6b7280)",
    cursor: "not-allowed",
    transform: "none",
  },
  buttonIcon: {
    width: "16px",
    height: "16px",
  },
  loadingIcon: {
    width: "16px",
    height: "16px",
    marginRight: "8px",
    animation: "spin 1s linear infinite",
  },
  loadingCircle: {
    opacity: 0.25,
  },
  loadingPath: {
    opacity: 0.75,
  },
  errorMessage: {
    marginTop: "16px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#b91c1c",
    padding: "12px 16px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  errorIcon: {
    width: "20px",
    height: "20px",
    color: "#ef4444",
  },
  errorText: {
    fontWeight: "500",
  },
  reportCard: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  actionBar: {
    background: "linear-gradient(45deg, #f8fafc, #f1f5f9)",
    padding: "24px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap" as const,
  },
  reportTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1f2937",
    margin: 0,
  },
  reportDate: {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "4px",
    margin: 0,
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
  },
  printButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    fontWeight: "500",
    color: "#374151",
    fontSize: "14px",
  },
  pdfButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(45deg, #dc2626, #b91c1c)",
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    fontWeight: "500",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    fontSize: "14px",
  },
  printableArea: {
    padding: "24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
  },
  summaryCardBlue: {
    background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
    border: "1px solid #93c5fd",
    padding: "24px",
    borderRadius: "12px",
  },
  summaryCardGreen: {
    background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
    border: "1px solid #86efac",
    padding: "24px",
    borderRadius: "12px",
  },
  summaryCardPurple: {
    background: "linear-gradient(135deg, #f3e8ff, #e9d5ff)",
    border: "1px solid #c4b5fd",
    padding: "24px",
    borderRadius: "12px",
  },
  summaryCardContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "4px",
    margin: 0,
  },
  summaryValueBlue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1e3a8a",
    margin: 0,
  },
  summaryValueGreen: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#14532d",
    margin: 0,
  },
  summaryValuePurple: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#581c87",
    margin: 0,
  },
  summaryIconBlue: {
    width: "48px",
    height: "48px",
    backgroundColor: "#bfdbfe",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryIconGreen: {
    width: "48px",
    height: "48px",
    backgroundColor: "#bbf7d0",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryIconPurple: {
    width: "48px",
    height: "48px",
    backgroundColor: "#e9d5ff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryIconSvg: {
    width: "24px",
    height: "24px",
    color: "#2563eb",
  },
  tableSection: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "24px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: 0,
  },
  sectionIcon: {
    width: "20px",
    height: "20px",
    color: "#2563eb",
  },
  tableContainer: {
    overflowX: "auto" as const,
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  table: {
    width: "100%",
    fontSize: "14px",
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
    borderCollapse: "collapse" as const,
  },
  tableHeaderBlue: {
    background: "linear-gradient(45deg, #2563eb, #1d4ed8)",
    color: "white",
  },
  tableHeaderGreen: {
    background: "linear-gradient(45deg, #16a34a, #15803d)",
    color: "white",
  },
  tableHeaderCell: {
    padding: "12px 16px",
    textAlign: "left" as const,
    fontWeight: "600",
  },
  tableHeaderCellRight: {
    padding: "12px 16px",
    textAlign: "right" as const,
    fontWeight: "600",
  },
  tableHeaderCellCenter: {
    padding: "12px 16px",
    textAlign: "center" as const,
    fontWeight: "600",
  },
  tableRowEven: {
    backgroundColor: "white",
  },
  tableRowOdd: {
    backgroundColor: "#f8fafc",
  },
  tableCell: {
    padding: "12px 16px",
    borderBottom: "1px solid #f3f4f6",
    color: "#1f2937",
  },
  tableCellBold: {
    padding: "12px 16px",
    borderBottom: "1px solid #f3f4f6",
    fontWeight: "500",
    color: "#1f2937",
  },
  tableCellRight: {
    padding: "12px 16px",
    borderBottom: "1px solid #f3f4f6",
    textAlign: "right" as const,
  },
  tableCellRightBold: {
    padding: "12px 16px",
    borderBottom: "1px solid #f3f4f6",
    textAlign: "right" as const,
    fontWeight: "600",
    color: "#1f2937",
  },
  tableCellRightGreen: {
    padding: "12px 16px",
    borderBottom: "1px solid #f3f4f6",
    textAlign: "right" as const,
    fontWeight: "bold",
    color: "#16a34a",
  },
  tableCellCenter: {
    padding: "12px 16px",
    borderBottom: "1px solid #f3f4f6",
    textAlign: "center" as const,
    color: "#6b7280",
    fontWeight: "500",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: "500",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
  },
  badgeBlue: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
  },
  badgePurple: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    backgroundColor: "#f3e8ff",
    color: "#7c2d12",
  },
};
