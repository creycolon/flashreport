import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import { Platform } from 'react-native';
import { cashMovementRepository } from '../../infrastructure/repositories/cashMovementRepository';
import { businessUnitRepository } from '../../infrastructure/repositories/businessUnitRepository';
import { formatCurrency, formatNumber, formatDate } from '../../application/utils/format';

/**
 * Attempt to send PDF via email as fallback when sharing fails
 */
async function attemptEmailFallback(uri: string, businessUnitName: string, periodLabel: string): Promise<void> {
    try {
        const isAvailable = await MailComposer.isAvailableAsync();
        if (!isAvailable) {
            throw new Error('No hay app de email configurada en este dispositivo.');
        }
        
        console.log('[ReportService] Attempting to send via email...');
        
        const result = await MailComposer.composeAsync({
            subject: `Reporte de Caja - ${businessUnitName}`,
            body: `Adjunto reporte de caja para ${businessUnitName} (${periodLabel}).\n\nGenerado por Flash Report App.`,
            recipients: [], // User can fill in
            attachments: [uri],
        });
        
        if (result.status === MailComposer.MailComposerStatus.SENT) {
            console.log('[ReportService] Email sent successfully');
        } else if (result.status === MailComposer.MailComposerStatus.SAVED) {
            console.log('[ReportService] Email saved as draft');
        } else if (result.status === MailComposer.MailComposerStatus.CANCELLED) {
            console.log('[ReportService] Email cancelled by user');
            throw new Error('El envío de email fue cancelado por el usuario.');
        } else {
            console.log('[ReportService] Email composer closed with status:', result.status);
        }
    } catch (error) {
        console.error('[ReportService] Email composer failed:', error);
        throw error;
    }
}

export const reportService = {
    generateCashMovementReport: async (businessUnitId: string, startDate?: string, endDate?: string) => {
        try {
            let bu: any;
            let movements: any[];
            let balanceData: any;

            if (businessUnitId === 'all') {
                bu = { name: 'Todos los Locales (Consolidado)' };
                movements = await (cashMovementRepository as any).listAll(500, 0, startDate, endDate);
                balanceData = await (cashMovementRepository as any).getGlobalBalance(startDate, endDate);
            } else {
                bu = await businessUnitRepository.getById(businessUnitId);
                if (!bu) throw new Error('Unidad de negocio no encontrada');
                movements = await (cashMovementRepository as any).listByBusinessUnit(businessUnitId, 300, 0, startDate, endDate);
                balanceData = await (cashMovementRepository as any).getBalance(businessUnitId, startDate, endDate);
            }

            const totalBalance = balanceData.balance || 0;
            const periodLabel = startDate && endDate
                ? `del ${formatDate(startDate)} al ${formatDate(endDate)}`
                : 'de todo el historial';

            console.log(`[ReportService] Data for ${businessUnitId}:`, {
                movementsCount: movements.length,
                totalBalance
            });

            if (movements.length === 0) {
                console.warn('[ReportService] WARNING: No movements found for this local.');
            }

            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Reporte de Caja - ${bu.name}</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; background: #fff; }
                        h1 { color: #1a1a1a; margin-bottom: 5px; font-size: 28px; }
                        .header { border-bottom: 3px solid #38ff14; padding-bottom: 20px; margin-bottom: 30px; }
                        .bu-name { color: #666; font-size: 18px; font-weight: bold; }
                        .balance-box { background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
                        .balance-label { font-size: 12px; text-transform: uppercase; color: #888; letter-spacing: 1px; font-weight: bold; }
                        .balance-value { font-size: 36px; font-weight: 800; color: #000; display: block; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed; }
                        th { text-align: left; padding: 14px; border-bottom: 2px solid #eee; background: #fafafa; font-size: 11px; text-transform: uppercase; color: #666; width: 25%; }
                        td { padding: 14px; border-bottom: 1px solid #f0f0f0; font-size: 14px; word-wrap: break-word; }
                        .type-credit { color: #2ecc71; font-weight: bold; }
                        .type-debit { color: #e74c3c; font-weight: bold; }
                        .footer { margin-top: 60px; font-size: 11px; color: #aaa; text-align: center; border-top: 1px solid #f0f0f0; padding-top: 20px; }
                        .summary { display: flex; gap: 40px; }
                        .summary-val { display: block; font-size: 18px; font-weight: bold; }
                        @media print {
                            body { padding: 0; }
                            .balance-box { border: 1px solid #ccc; -webkit-print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Cierre de Caja Operativo</h1>
                        <div class="bu-name">${bu.name}</div>
                        <div style="font-size: 11px; color: #999; margin-top: 4px;">Período: ${periodLabel}</div>
                    </div>
                    
                        <div>
                            <span class="balance-label">Saldo Neto en Caja</span>
                            <span class="balance-value">${formatCurrency(totalBalance)}</span>
                        </div>
                        <div class="summary">
                            <div>
                                <span class="balance-label">Ingresos Total</span>
                                <span class="summary-val" style="color: #2ecc71">${formatCurrency(balanceData.total_credits)}</span>
                            </div>
                            <div>
                                <span class="balance-label">Egresos Total</span>
                                <span class="summary-val" style="color: #e74c3c">${formatCurrency(balanceData.total_debits)}</span>
                            </div>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 15%">Fecha</th>
                                <th style="width: 25%">Local / Categoría</th>
                                <th>Descripción</th>
                                <th style="width: 20%; text-align: right">Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${movements && movements.length > 0 ? movements.map((m: any) => `
                                <tr>
                                    <td>${formatDate(m.transaction_date)}</td>
                                    <td>
                                        <div style="font-weight: bold">${m.bu_name || bu.name}</div>
                                        <div style="font-size: 11px; color: #888">${m.category_name}</div>
                                    </td>
                                    <td>${m.description || '-'}</td>
                                    <td style="text-align: right" class="${m.type === 'CR' ? 'type-credit' : 'type-debit'}">
                                        ${m.type === 'CR' ? '+' : '-'}${formatCurrency(m.amount)}
                                    </td>
                                </tr>
                            `).join('') : '<tr><td colspan="4" style="text-align: center; padding: 40px; color: #999;">No hay movimientos registrados en este período</td></tr>'}
                        </tbody>
                    </table>

                    <div class="footer">
                        Flash Report App - Documento Oficial de Control - Generado el ${formatDate(new Date().toISOString())}
                    </div>
                </body>
                </html>
            `;

            if (Platform.OS === 'web') {
                // Manual isolated print for Web to prevent "copying the screen"
                const printWindow = window.open('', '_blank', 'width=800,height=900');
                if (printWindow) {
                    printWindow.document.write(html);
                    printWindow.document.close();

                    // Wait for styles and content to be ready
                    printWindow.onload = () => {
                        printWindow.focus();
                        setTimeout(() => {
                            printWindow.print();
                        }, 300);
                    };
                } else {
                    // Fallback to library if popup is blocked
                    await Print.printAsync({ html });
                }
            } else {
                const { uri } = await Print.printToFileAsync({ html });
                
                console.log('[ReportService] PDF generated at:', uri);
                
                // Try sharing first (opens system share sheet)
                try {
                    const isSharingAvailable = await Sharing.isAvailableAsync();
                    if (!isSharingAvailable) {
                        console.warn('[ReportService] Sharing not available on this device');
                        // Fallback to email composer if available
                        await attemptEmailFallback(uri, bu.name, periodLabel);
                        return true;
                    }
                    
                    console.log('[ReportService] Opening share sheet...');
                    await Sharing.shareAsync(uri, { 
                        UTI: '.pdf', 
                        mimeType: 'application/pdf',
                        dialogTitle: `Reporte de Caja - ${bu.name}`
                    });
                    console.log('[ReportService] Share sheet opened successfully');
                    
                } catch (shareError) {
                    console.error('[ReportService] Sharing failed:', shareError);
                    // Attempt email fallback
                    try {
                        await attemptEmailFallback(uri, bu.name, periodLabel);
                    } catch (emailError) {
                        console.error('[ReportService] Email fallback also failed:', emailError);
                        // Re-throw the original error
                        throw new Error(`No se pudo compartir el reporte. Asegúrate de tener una app de email o compartir instalada. Error: ${String(shareError)}`);
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    }
};
