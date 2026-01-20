import { Report, ExportConfig, ExportData, ExportGrouping, ReportsSummary } from '../types/reportTypes';
import { ReportService } from './reportService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Serviço de exportação de relatórios
 */
export const ExportService = {
    /**
     * Prepara dados para exportação
     */
    async prepareExportData(reports: Report[], config: ExportConfig): Promise<ExportData> {
        const summary = await ReportService.getSummary();

        return {
            titulo: `Relatórios Sivep-Endemias - ${config.tipoAgrupamento}`,
            geradoEm: new Date().toISOString(),
            resumo: summary,
            dados: reports,
            agrupamento: config.tipoAgrupamento
        };
    },

    /**
     * Exporta para PDF
     */
    async exportToPDF(reports: Report[], config: ExportConfig): Promise<void> {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Título
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Sivep-Endemias', pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Relatório de ${config.tipoAgrupamento.charAt(0).toUpperCase() + config.tipoAgrupamento.slice(1)}`, pageWidth / 2, 28, { align: 'center' });

        // Data de geração
        doc.setFontSize(9);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 35, { align: 'center' });

        // Resumo
        if (config.incluirResumo) {
            const summary = this.computeSummaryFromReports(reports);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Resumo', 14, 48);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total de Relatórios: ${summary.total}`, 14, 56);
            doc.text(`Concluídos: ${summary.concluidos}`, 14, 62);
            doc.text(`Em Aberto: ${summary.emAberto}`, 14, 68);
        }

        // Tabela de dados
        const startY = config.incluirResumo ? 78 : 45;

        if (config.tipoAgrupamento === 'detalhado') {
            autoTable(doc, {
                startY,
                head: [['Localidade', 'Semana', 'Ciclo', 'Ano', 'Status', 'Data']],
                body: reports.map(r => [
                    r.localidade,
                    r.semanaEpidemiologica,
                    `Ciclo ${r.ciclo}`,
                    r.ano.toString(),
                    r.concluido ? 'Concluído' : 'Em Aberto',
                    new Date(r.createdAt).toLocaleDateString('pt-BR')
                ]),
                styles: { fontSize: 9 },
                headStyles: { fillColor: [59, 130, 246] }
            });
        } else if (config.tipoAgrupamento === 'localidade') {
            const grouped = reports.reduce((acc, r) => {
                if (!acc[r.localidade]) acc[r.localidade] = [];
                acc[r.localidade].push(r);
                return acc;
            }, {} as Record<string, Report[]>);

            autoTable(doc, {
                startY,
                head: [['Localidade', 'Total Relatórios', 'Ciclos', 'Semanas']],
                body: Object.entries(grouped).map(([loc, reps]) => [
                    loc,
                    reps.length.toString(),
                    [...new Set(reps.map(r => r.ciclo))].join(', '),
                    [...new Set(reps.map(r => r.semanaEpidemiologica))].join(', ')
                ]),
                styles: { fontSize: 9 },
                headStyles: { fillColor: [59, 130, 246] }
            });
        } else if (config.tipoAgrupamento === 'ciclo') {
            const grouped = reports.reduce((acc, r) => {
                if (!acc[r.ciclo]) acc[r.ciclo] = [];
                acc[r.ciclo].push(r);
                return acc;
            }, {} as Record<number, Report[]>);

            autoTable(doc, {
                startY,
                head: [['Ciclo', 'Total Relatórios', 'Localidades', 'Semanas']],
                body: Object.entries(grouped).map(([ciclo, reps]) => [
                    `Ciclo ${ciclo}`,
                    reps.length.toString(),
                    [...new Set(reps.map(r => r.localidade))].length.toString(),
                    [...new Set(reps.map(r => r.semanaEpidemiologica))].join(', ')
                ]),
                styles: { fontSize: 9 },
                headStyles: { fillColor: [59, 130, 246] }
            });
        } else if (config.tipoAgrupamento === 'semana') {
            const grouped = reports.reduce((acc, r) => {
                if (!acc[r.semanaEpidemiologica]) acc[r.semanaEpidemiologica] = [];
                acc[r.semanaEpidemiologica].push(r);
                return acc;
            }, {} as Record<string, Report[]>);

            autoTable(doc, {
                startY,
                head: [['Semana', 'Total Relatórios', 'Localidades', 'Ciclos']],
                body: Object.entries(grouped).map(([semana, reps]) => [
                    semana,
                    reps.length.toString(),
                    [...new Set(reps.map(r => r.localidade))].length.toString(),
                    [...new Set(reps.map(r => r.ciclo))].join(', ')
                ]),
                styles: { fontSize: 9 },
                headStyles: { fillColor: [59, 130, 246] }
            });
        }

        // Rodapé
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(
                `Divisão de Endemias - Página ${i} de ${pageCount}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        // Download
        const filename = config.nomeArquivo || `sivep-relatorio-${new Date().toISOString().split('T')[0]}`;
        doc.save(`${filename}.pdf`);
    },

    /**
     * Exporta para Excel
     */
    async exportToExcel(reports: Report[], config: ExportConfig): Promise<void> {
        const wb = XLSX.utils.book_new();

        // Aba de resumo
        if (config.incluirResumo) {
            const summary = this.computeSummaryFromReports(reports);
            const resumoData = [
                ['Resumo de Relatórios'],
                [''],
                ['Total', summary.total],
                ['Concluídos', summary.concluidos],
                ['Em Aberto', summary.emAberto],
                ['Última Semana', summary.ultimaSemana || '-'],
                ['Localidade Mais Frequente', summary.localidadeMaisFrequente || '-'],
                [''],
                ['Gerado em', new Date().toLocaleString('pt-BR')]
            ];
            const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
            XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');
        }

        // Aba de dados detalhados
        const detalhesHeader = ['ID', 'Localidade', 'Semana Epidemiológica', 'Ciclo', 'Ano', 'Status', 'Data Criação'];
        const detalhesData = reports.map(r => [
            r.id,
            r.localidade,
            r.semanaEpidemiologica,
            r.ciclo,
            r.ano,
            r.concluido ? 'Concluído' : 'Em Aberto',
            new Date(r.createdAt).toLocaleString('pt-BR')
        ]);
        const wsDetalhes = XLSX.utils.aoa_to_sheet([detalhesHeader, ...detalhesData]);
        XLSX.utils.book_append_sheet(wb, wsDetalhes, 'Detalhes');

        // Aba por localidade
        if (config.tipoAgrupamento === 'localidade' || config.tipoAgrupamento === 'detalhado') {
            const locAnalytics = this.computeLocalityAnalytics(reports);
            const locHeader = ['Localidade', 'Total Relatórios', 'Semanas Ativas'];
            const locData = locAnalytics.map(a => [
                a.localidade,
                a.totalReports,
                a.semanasAtivas.join(', ')
            ]);
            const wsLoc = XLSX.utils.aoa_to_sheet([locHeader, ...locData]);
            XLSX.utils.book_append_sheet(wb, wsLoc, 'Por Localidade');
        }

        // Aba por ciclo
        if (config.tipoAgrupamento === 'ciclo' || config.tipoAgrupamento === 'detalhado') {
            const cycleAnalytics = this.computeCycleAnalytics(reports);
            const cicloHeader = ['Ciclo', 'Total Relatórios', 'Total Localidades'];
            const cicloData = cycleAnalytics.map(a => [
                a.ciclo,
                a.totalReports,
                a.totalLocalidades
            ]);
            const wsCiclo = XLSX.utils.aoa_to_sheet([cicloHeader, ...cicloData]);
            XLSX.utils.book_append_sheet(wb, wsCiclo, 'Por Ciclo');
        }

        // Download
        const filename = config.nomeArquivo || `sivep-relatorio-${new Date().toISOString().split('T')[0]}`;
        XLSX.writeFile(wb, `${filename}.xlsx`);
    },

    /**
     * Exporta para CSV
     */
    exportToCSV(reports: Report[]): void {
        const header = ['ID', 'Localidade', 'Semana', 'Ciclo', 'Ano', 'Status', 'Data'];
        const rows = reports.map(r => [
            r.id,
            r.localidade,
            r.semanaEpidemiologica,
            r.ciclo.toString(),
            r.ano.toString(),
            r.concluido ? 'Concluído' : 'Em Aberto',
            new Date(r.createdAt).toLocaleDateString('pt-BR')
        ]);

        const csvContent = [
            header.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sivep-relatorio-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    },

    /**
     * Exporta para JSON
     */
    exportToJSON(reports: Report[], config: ExportConfig): void {
        const data = {
            titulo: 'Sivep-Endemias - Relatórios',
            geradoEm: new Date().toISOString(),
            resumo: config.incluirResumo ? this.computeSummaryFromReports(reports) : null,
            totalRegistros: reports.length,
            dados: reports
        };

        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sivep-relatorio-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    /**
     * Exporta de acordo com o formato configurado
     */
    async export(reports: Report[], config: ExportConfig): Promise<void> {
        switch (config.formato) {
            case 'pdf':
                await this.exportToPDF(reports, config);
                break;
            case 'excel':
                await this.exportToExcel(reports, config);
                break;
            case 'csv':
                this.exportToCSV(reports);
                break;
            case 'json':
                this.exportToJSON(reports, config);
                break;
        }
    },

    /**
     * Computa resumo a partir de um array de reports (sem I/O)
     */
    computeSummaryFromReports(reports: Report[]): ReportsSummary {
        const total = reports.length;
        const concluidos = reports.filter(r => r.concluido).length;
        const emAberto = total - concluidos;

        const ultimaSemana = reports.length > 0
            ? reports.map(r => r.semanaEpidemiologica).sort().pop() || null
            : null;

        const locCounts: Record<string, number> = {};
        reports.forEach(r => {
            if (r.localidade) locCounts[r.localidade] = (locCounts[r.localidade] || 0) + 1;
        });

        let localidadeMaisFrequente: string | null = null;
        let maxCount = 0;
        Object.entries(locCounts).forEach(([loc, count]) => {
            if (count > maxCount) {
                maxCount = count;
                localidadeMaisFrequente = loc;
            }
        });

        return { total, concluidos, emAberto, ultimaSemana, localidadeMaisFrequente };
    },

    /**
     * Computa analytics por localidade a partir de reports
     */
    computeLocalityAnalytics(reports: Report[]) {
        const grouped: Record<string, Report[]> = {};
        reports.forEach(r => {
            if (!grouped[r.localidade]) grouped[r.localidade] = [];
            grouped[r.localidade].push(r);
        });

        return Object.entries(grouped).map(([localidade, reps]) => ({
            localidade,
            totalReports: reps.length,
            semanasAtivas: [...new Set(reps.map(r => r.semanaEpidemiologica))]
        }));
    },

    /**
     * Computa analytics por ciclo a partir de reports
     */
    computeCycleAnalytics(reports: Report[]) {
        const grouped: Record<number, Report[]> = {};
        reports.forEach(r => {
            if (!grouped[r.ciclo]) grouped[r.ciclo] = [];
            grouped[r.ciclo].push(r);
        });

        return Object.entries(grouped).map(([ciclo, reps]) => ({
            ciclo: parseInt(ciclo),
            totalReports: reps.length,
            totalLocalidades: [...new Set(reps.map(r => r.localidade))].length
        }));
    }
};
