import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const formatTime = (value) => {
    if (value < 1) {
        return '<1 día';
    } else {
        return `${parseFloat(value).toFixed(1)} días`;
    }
};

const safelyAddImage = (doc, imageSrc, x, y, width, height) => {
    try {
        if (imageSrc.startsWith('data:')) {
            doc.addImage(imageSrc, 'PNG', x, y, width, height, undefined, 'FAST');
            return true;
        } else {
            try {
                doc.addImage(imageSrc, 'PNG', x, y, width, height, undefined, 'FAST');
                return true;
            } catch (directError) {
                console.error(`Could not load image from ${imageSrc}:`, directError);
                
                doc.setDrawColor(200, 200, 200);
                doc.setFillColor(240, 240, 240);
                doc.roundedRect(x, y, width, height, 2, 2, 'FD');
                
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text('Imagen no disponible', x + width/2, y + height/2, { align: 'center' });
                return false;
            }
        }  
    } catch (error) {
        console.error('Error in safelyAddImage:', error);
        return false;
    }
};

const createTemporaryChartsForPDF = async (chartData) => {
    console.log('Creating temporary invisible charts for PDF...');
    
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '800px';
    tempContainer.style.height = '600px';
    tempContainer.id = 'temp-charts-container';
    document.body.appendChild(tempContainer);
    
    const tempCharts = {};
    
    try {
        const pdfChartOptions = {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#000000',
                        font: { family: "'Segoe UI', sans-serif", size: 12 }
                    }
                },
                tooltip: { enabled: false }
            },
            scales: {
                x: {
                    ticks: { color: '#000000', font: { family: "'Segoe UI', sans-serif" } },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' }
                },
                y: {
                    ticks: { color: '#000000', font: { family: "'Segoe UI', sans-serif" } },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' }
                }
            }
        };
        
        const pdfPieChartOptions = {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#000000',
                        padding: 10,
                        usePointStyle: true,
                        font: { family: "'Segoe UI', sans-serif", size: 11 }
                    }
                },
                tooltip: { enabled: false }
            }
        };
        
        const monthlyCanvas = document.createElement('canvas');
        monthlyCanvas.width = 600;
        monthlyCanvas.height = 400;
        tempContainer.appendChild(monthlyCanvas);
        
        tempCharts.monthly = new ChartJS(monthlyCanvas, {
            type: 'bar',
            data: chartData.solicitudesPorMesData,
            options: pdfChartOptions
        });
        
        const productsCanvas = document.createElement('canvas');
        productsCanvas.width = 400;
        productsCanvas.height = 400;
        tempContainer.appendChild(productsCanvas);
        
        tempCharts.products = new ChartJS(productsCanvas, {
            type: 'pie',
            data: chartData.productosMasSolicitadosData,
            options: pdfPieChartOptions
        });
        
        const provincesCanvas = document.createElement('canvas');
        provincesCanvas.width = 600;
        provincesCanvas.height = 400;
        tempContainer.appendChild(provincesCanvas);
        
        tempCharts.provinces = new ChartJS(provincesCanvas, {
            type: 'bar',
            data: chartData.solicitudesPorProvinciaData,
            options: pdfChartOptions
        });
        
        const solicitudesStatusCanvas = document.createElement('canvas');
        solicitudesStatusCanvas.width = 400;
        solicitudesStatusCanvas.height = 400;
        tempContainer.appendChild(solicitudesStatusCanvas);
        
        tempCharts.solicitudesStatus = new ChartJS(solicitudesStatusCanvas, {
            type: 'pie',
            data: chartData.solicitudesStatusData,
            options: pdfPieChartOptions
        });
        
        const donacionesStatusCanvas = document.createElement('canvas');
        donacionesStatusCanvas.width = 400;
        donacionesStatusCanvas.height = 400;
        tempContainer.appendChild(donacionesStatusCanvas);
        
        tempCharts.donacionesStatus = new ChartJS(donacionesStatusCanvas, {
            type: 'pie',
            data: chartData.donacionesStatusData,
            options: pdfPieChartOptions
        });
        
        console.log('All temporary charts created successfully');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return tempCharts;
        
    } catch (error) {
        console.error('Error creating temporary charts:', error);
        if (tempContainer.parentNode) {
            tempContainer.parentNode.removeChild(tempContainer);
        }
        throw error;
    }
};

const captureTemporaryChartImages = (tempCharts) => {
    console.log('Capturing images from temporary charts...');
    
    const chartImages = {};
    
    try {
        if (tempCharts.monthly) {
            chartImages.monthly = tempCharts.monthly.canvas.toDataURL('image/png', 1.0);
            console.log('Monthly chart captured');
        }
        
        if (tempCharts.products) {
            chartImages.products = tempCharts.products.canvas.toDataURL('image/png', 1.0);
            console.log('Products chart captured');
        }
        
        if (tempCharts.provinces) {
            chartImages.provinces = tempCharts.provinces.canvas.toDataURL('image/png', 1.0);
            console.log('Provinces chart captured');
        }
        
        if (tempCharts.solicitudesStatus) {
            chartImages.solicitudesStatus = tempCharts.solicitudesStatus.canvas.toDataURL('image/png', 1.0);
            console.log('Solicitudes status chart captured');
        }
        
        if (tempCharts.donacionesStatus) {
            chartImages.donacionesStatus = tempCharts.donacionesStatus.canvas.toDataURL('image/png', 1.0);
            console.log('Donaciones status chart captured');
        }
        
        return chartImages;
        
    } catch (error) {
        console.error('Error capturing chart images:', error);
        return {};
    }
};

const cleanupTemporaryCharts = (tempCharts) => {
    console.log('Cleaning up temporary charts...');
    
    try {
        Object.values(tempCharts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        
        const tempContainer = document.getElementById('temp-charts-container');
        if (tempContainer && tempContainer.parentNode) {
            tempContainer.parentNode.removeChild(tempContainer);
        }
        
        console.log('Temporary charts cleaned up successfully');
    } catch (error) {
        console.error('Error cleaning up temporary charts:', error);
    }
};

export const generateMetricsPDF = async (metricas, chartData) => {
    if (!metricas) {
        alert('No hay datos de métricas disponibles para generar el PDF.');
        return;
    }

    try {
        console.log('Starting PDF generation with temporary charts...');
        
        const tempCharts = await createTemporaryChartsForPDF(chartData);
        const chartImages = captureTemporaryChartImages(tempCharts);

        const doc = new jsPDF('portrait', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);
        
        console.log('PDF document created with dimensions:', { pageWidth, pageHeight });
        
        const primaryColor = [25, 73, 115];
        const secondaryColor = [35, 35, 35];
        const accentColor = [255, 193, 7];
        const lightGray = [230, 230, 230];
        
        const currentDate = new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        console.log('Generated date:', currentDate);
        
        const addFooter = (doc, pages = null) => {
            const pageCount = pages || doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            
            for(let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setTextColor(150, 150, 150);
                
                doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
                
                doc.text('Sistema de Seguimiento de Donaciones', margin, pageHeight - 10);
                doc.text(`Generado: ${currentDate}`, pageWidth/2, pageHeight - 10, { align: 'center' });
                
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.5);
                doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
            }
        };
        
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 60, 'F');
        
        safelyAddImage(doc, '/logoNOBG.png', pageWidth/2 - 25, 10, 50, 50);
        
        doc.setFontSize(24);
        doc.setTextColor(50, 50, 50);
        doc.text('Reporte de Distribución', pageWidth/2, 80, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        doc.text('Sistema de Seguimiento de Donaciones', pageWidth/2, 90, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Informe generado el: ${currentDate}`, pageWidth/2, 100, { align: 'center' });
        
        doc.setDrawColor(...accentColor);
        doc.setLineWidth(1);
        doc.line(margin + 20, 110, pageWidth - margin - 20, 110);
        
        addFooter(doc, 1);
        
        doc.addPage();
        
        const addSectionHeader = (text, y, sectionNumber) => {
            doc.setFillColor(...primaryColor);
            doc.rect(margin, y - 6, contentWidth, 10, 'F');
            doc.setFontSize(12);
            doc.setTextColor(255, 255, 255);
            doc.text(text, margin + 5, y);
            return y + 15;
        };
        
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 20, 'F');
        
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text('Resumen General', pageWidth/2, 13, { align: 'center' });
        
        doc.setFontSize(8);
        doc.text(`Generado: ${currentDate}`, pageWidth - margin, 13, { align: 'right' });
        
        let startY = 30;
        doc.setDrawColor(...lightGray);
        
        const createMetricBoxes = (metrics, startY) => {
            const boxWidth = contentWidth / metrics.length;
            const boxHeight = 25;
            
            metrics.forEach((metric, index) => {
                const xPos = margin + (index * boxWidth);
                
                doc.setFillColor(250, 250, 250);
                doc.roundedRect(xPos, startY, boxWidth - 4, boxHeight, 1, 1, 'F');
                
                doc.setFontSize(16);
                doc.setTextColor(...secondaryColor);
                doc.text(metric.value.toString(), xPos + boxWidth/2, startY + 12, { align: 'center' });
                
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text(metric.label, xPos + boxWidth/2, startY + 20, { align: 'center' });
            });
            
            return startY + boxHeight + 10;
        };
        
        const addSubsectionHeader = (text, y, sectionNumber, subsectionNumber) => {
            doc.setFontSize(11);
            doc.setTextColor(...primaryColor);
            doc.text(text, margin, y);
            
            doc.setDrawColor(...lightGray);
            doc.setLineWidth(0.5);
            doc.line(margin, y + 3, margin + doc.getTextWidth(text), y + 3);
            
            return y + 10;
        };
        
        startY = addSubsectionHeader('Principales Métricas', startY, 1, 1);
        
        const row1Metrics = [
            { label: 'Solicitudes Atendidas', value: metricas.totalSolicitudesRecibidas },
            { label: 'Donaciones Entregadas', value: metricas.donacionesEntregadas },
            { label: 'Solicitudes Sin Responder', value: metricas.solicitudesSinResponder }
        ];
        
        startY = createMetricBoxes(row1Metrics, startY);
        
        const row2Metrics = [
            { label: 'Solicitudes Aprobadas', value: metricas.solicitudesAprobadas },
            { label: 'Solicitudes Rechazadas', value: metricas.solicitudesRechazadas },
            { label: 'Donaciones Pendientes', value: metricas.donacionesPendientes }
        ];
        
        startY = createMetricBoxes(row2Metrics, startY);
        
        const row3Metrics = [
            { label: 'Tiempo Prom. Respuesta (días)', value: formatTime(metricas.tiempoPromedioRespuesta) },
            { label: 'Tiempo Prom. Entrega (días)', value: formatTime(metricas.tiempoPromedioEntrega) }
        ];
        
        startY = createMetricBoxes(row3Metrics, startY + 5);
        
        startY = addSubsectionHeader('Productos más Solicitados', startY + 10, 1, 2);
        
        const productsData = Object.entries(metricas.topProductosMasSolicitados)
            .map(([product, count]) => [product, count])
            .sort((a, b) => b[1] - a[1]);
        
        if (chartImages.products) {
            const chartWidth = 70;
            const chartHeight = 70;
            const chartX = pageWidth - margin - chartWidth;
            
            doc.setFontSize(10);
            doc.setTextColor(...primaryColor);
            doc.text('Distribución de Productos', chartX + chartWidth/2, startY - 5, { align: 'center' });
            
            doc.addImage(chartImages.products, 'PNG', chartX, startY, chartWidth, chartHeight);
            
            console.log('Products chart added to PDF successfully');
        } else {
            console.warn('Products chart image not available');
            
            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(240, 240, 240);
            doc.rect(pageWidth - margin - 70, startY, 70, 70, 'FD');
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text('Gráfico no disponible', pageWidth - margin - 35, startY + 35, { align: 'center' });
        }
        
        autoTable(doc, {
            startY: startY,
            head: [['Producto', 'Cantidad', '% del Total']],
            body: productsData.map(([product, count]) => {
                const totalProducts = productsData.reduce((sum, [_, c]) => sum + c, 0);
                const percentage = ((count / totalProducts) * 100).toFixed(1);
                return [product, count, `${percentage}%`];
            }),
            theme: 'grid',
            styles: { 
                fontSize: 9,
                cellPadding: 4
            },
            headStyles: {
                fillColor: primaryColor,
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [248, 248, 248]
            },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 25, halign: 'center' }
            },
            margin: { left: margin, right: margin + 80 }
        });
        
        startY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        
        const topProduct = productsData[0];
        const totalProductCount = productsData.reduce((sum, [_, count]) => sum + count, 0);
        
        doc.text('Análisis de productos solicitados:', margin, startY);
        startY += 5;
        doc.setFontSize(9);
        doc.text(`• El producto más solicitado es "${topProduct[0]}" con ${topProduct[1]} solicitudes (${((topProduct[1] / totalProductCount) * 100).toFixed(1)}% del total)`, margin + 5, startY);
        startY += 5;
        
        if (productsData.length > 1) {
            const secondProduct = productsData[1];
            doc.text(`• El segundo producto más solicitado es "${secondProduct[0]}" con ${secondProduct[1]} solicitudes (${((secondProduct[1] / totalProductCount) * 100).toFixed(1)}% del total)`, margin + 5, startY);
            startY += 5;
        }
        
        doc.text(`• En total se muestran los ${productsData.length} tipos diferentes de productos más solicitados`, margin + 5, startY);
        startY += 10;
        
        doc.addPage();
        
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 20, 'F');
        
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text('Análisis por Periodos y Ubicación', pageWidth/2, 13, { align: 'center' });
        
        doc.setFontSize(8);
        doc.text(`Generado: ${currentDate}`, pageWidth - margin, 13, { align: 'right' });
        
        startY = 30;
        startY = addSubsectionHeader('Solicitudes por Mes', startY, 2, 1);
        
        if (chartImages.monthly) {
            const chartWidth = 140;
            const chartHeight = 90;
            const chartX = (pageWidth - chartWidth) / 2;
            
            doc.setFontSize(12);
            doc.setTextColor(...primaryColor);
            doc.text('Tendencia Mensual de Solicitudes', pageWidth/2, startY - 5, { align: 'center' });
            
            doc.addImage(chartImages.monthly, 'PNG', chartX, startY, chartWidth, chartHeight);
            
            startY += chartHeight + 15;
            console.log('Monthly chart added to PDF successfully');
        } else {
            console.warn('Monthly chart image not available');
            startY += 10;
        }
        
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const monthOrder = {};
        monthNames.forEach((month, index) => {
            monthOrder[month] = index;
        });
        
        const monthlyData = Object.entries(metricas.solicitudesPorMes)
            .map(([month, count]) => [month, count])
            .sort((a, b) => {
                const monthA = monthOrder[a[0]];
                const monthB = monthOrder[b[0]];
                if (monthA !== undefined && monthB !== undefined) {
                    return monthA - monthB;
                }
                return a[0].localeCompare(b[0]);
            });
        
        autoTable(doc, {
            startY: startY,
            head: [['Mes', 'Solicitudes']],
            body: monthlyData,
            theme: 'grid',
            styles: { 
                fontSize: 9,
                cellPadding: 5
            },
            headStyles: {
                fillColor: primaryColor,
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [248, 248, 248]
            },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 30, halign: 'center' }
            },
            margin: { left: margin, right: margin },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 1) {
                    const row = monthlyData[data.row.index];
                    const allValues = monthlyData.map(item => item[1]);
                    const maxValue = Math.max(...allValues);
                    
                    if (row[1] === maxValue) {
                        doc.setFillColor(245, 245, 160);
                        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                        doc.setTextColor(0, 0, 0);
                        doc.text(row[1].toString(), data.cell.x + data.cell.width/2, data.cell.y + data.cell.height/2, {
                            align: 'center',
                            baseline: 'middle'
                        });
                    }
                }
            }
        });
        
        startY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        
        const allMonthlyValues = monthlyData.map(item => item[1]);
        const maxMonth = monthlyData.find(item => item[1] === Math.max(...allMonthlyValues));
        const minMonth = monthlyData.find(item => item[1] === Math.min(...allMonthlyValues));
        const averageRequests = allMonthlyValues.reduce((sum, val) => sum + val, 0) / allMonthlyValues.length;
        
        doc.text('Resumen de tendencia mensual:', margin, startY);
        startY += 5;
        doc.setFontSize(9);
        doc.text(`• Mes con mayor número de solicitudes: ${maxMonth[0]} (${maxMonth[1]} solicitudes)`, margin + 5, startY);
        startY += 5;
        doc.text(`• Mes con menor número de solicitudes: ${minMonth[0]} (${minMonth[1]} solicitudes)`, margin + 5, startY);
        startY += 5;
        doc.text(`• Promedio mensual de solicitudes: ${averageRequests.toFixed(1)} solicitudes`, margin + 5, startY);
        startY += 10;
        
        doc.addPage();
        
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 20, 'F');
        
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text('Análisis Geográfico', pageWidth/2, 13, { align: 'center' });
        
        doc.setFontSize(8);
        doc.text(`Generado: ${currentDate}`, pageWidth - margin, 13, { align: 'right' });
        
        startY = 30;
        startY = addSubsectionHeader('Solicitudes por Provincia', startY, 2, 2);
        
        const provincesData = Object.entries(metricas.solicitudesPorProvincia)
            .map(([province, count]) => [province, count])
            .sort((a, b) => b[1] - a[1]);
        
        autoTable(doc, {
            startY: startY,
            head: [['Provincia', 'Solicitudes', '% del Total']],
            body: provincesData.map(([province, count]) => {
                const percentage = ((count / metricas.totalSolicitudesRecibidas) * 100).toFixed(1);
                return [province, count, `${percentage}%`];
            }),
            theme: 'grid',
            styles: { 
                fontSize: 9,
                cellPadding: 4
            },
            headStyles: {
                fillColor: primaryColor,
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [248, 248, 248]
            },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 30, halign: 'center' },
                2: { cellWidth: 30, halign: 'center' }
            },
            margin: { left: margin, right: margin },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 1) {
                    const row = provincesData[data.row.index];
                    const allValues = provincesData.map(item => item[1]);
                    const maxValue = Math.max(...allValues);
                    
                    if (row[1] === maxValue) {
                        doc.setFillColor(245, 245, 160);
                        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                        doc.setTextColor(0, 0, 0);
                        doc.text(row[1].toString(), data.cell.x + data.cell.width/2, data.cell.y + data.cell.height/2, {
                            align: 'center',
                            baseline: 'middle'
                        });
                    }
                }
            }
        });
        
        startY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);

        const topProvince = provincesData[0];
        const totalProvinces = provincesData.length;
        
        doc.text('Distribución geográfica:', margin, startY);
        startY += 5;
        doc.setFontSize(9);
        doc.text(`• ${topProvince[0]} representa el ${((topProvince[1] / metricas.totalSolicitudesRecibidas) * 100).toFixed(1)}% del total de solicitudes`, margin + 5, startY);
        startY += 5;
        doc.text(`• ${totalProvinces} provincias han registrado solicitudes en el sistema`, margin + 5, startY);
        startY += 15;
        
        if (chartImages.provinces) {
            const chartWidth = 120;
            const chartHeight = 80;
            const chartX = (pageWidth - chartWidth) / 2;
            
            doc.setFontSize(12);
            doc.setTextColor(...primaryColor);
            doc.text('Gráfico de Distribución por Provincia', pageWidth/2, startY, { align: 'center' });
            
            doc.addImage(chartImages.provinces, 'PNG', chartX, startY + 5, chartWidth, chartHeight);
            
            console.log('Provinces chart added to PDF successfully');
        } else {
            console.warn('Provinces chart image not available');
            
            const placeholderWidth = 120;
            const placeholderHeight = 80;
            const placeholderX = (pageWidth - placeholderWidth) / 2;
            
            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(240, 240, 240);
            doc.rect(placeholderX, startY + 5, placeholderWidth, placeholderHeight, 'FD');
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('Gráfico no disponible', pageWidth/2, startY + 45, { align: 'center' });
        }
        
        doc.addPage();
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 20, 'F');
        
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text('Estado de Solicitudes y Donaciones', pageWidth/2, 13, { align: 'center' });
        doc.setFontSize(8);
        doc.text(`Generado: ${currentDate}`, pageWidth - margin, 13, { align: 'right' });
        
        startY = 30;
        startY = addSubsectionHeader('Estado de Solicitudes', startY, 3, 1);
        
        const solicitudesStatusData = [
            ['Sin Responder', metricas.solicitudesSinResponder, ((metricas.solicitudesSinResponder / metricas.totalSolicitudesRecibidas) * 100).toFixed(1) + '%'],
            ['Aprobadas', metricas.solicitudesAprobadas, ((metricas.solicitudesAprobadas / metricas.totalSolicitudesRecibidas) * 100).toFixed(1) + '%'],
            ['Rechazadas', metricas.solicitudesRechazadas, ((metricas.solicitudesRechazadas / metricas.totalSolicitudesRecibidas) * 100).toFixed(1) + '%']
        ];
        
        autoTable(doc, {
            startY: startY,
            head: [['Estado', 'Cantidad', 'Porcentaje']],
            body: solicitudesStatusData,
            theme: 'grid',
            styles: { 
                fontSize: 9,
                cellPadding: 4
            },
            headStyles: {
                fillColor: primaryColor,
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [248, 248, 248]
            },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 25, halign: 'center' }
            },
            margin: { left: margin, right: margin }
        });
        
        const solicitudesTableEndY = doc.lastAutoTable.finalY;
        startY = doc.lastAutoTable.finalY + 20;
        startY = addSubsectionHeader('Estado de Donaciones', startY, 3, 2);
        
        const totalDonaciones = metricas.donacionesPendientes + metricas.donacionesEntregadas;
        const donacionesStatusData = [
            ['Pendientes', metricas.donacionesPendientes, ((metricas.donacionesPendientes / totalDonaciones) * 100).toFixed(1) + '%'],
            ['Entregadas', metricas.donacionesEntregadas, ((metricas.donacionesEntregadas / totalDonaciones) * 100).toFixed(1) + '%']
        ];
        
        autoTable(doc, {
            startY: startY,
            head: [['Estado', 'Cantidad', 'Porcentaje']],
            body: donacionesStatusData,
            theme: 'grid',
            styles: { 
                fontSize: 9,
                cellPadding: 4
            },
            headStyles: {
                fillColor: primaryColor,
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [248, 248, 248]
            },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 25, halign: 'center' }
            },
            margin: { left: margin, right: margin }
        });
        
        const donacionesTableEndY = doc.lastAutoTable.finalY;
        
        const chartsY = Math.max(solicitudesTableEndY, donacionesTableEndY) + 15;
        const chartWidth = 70;
        const chartHeight = 70;
        const chartSpacing = 20;
        const totalChartsWidth = (chartWidth * 2) + chartSpacing;
        const chartsStartX = (pageWidth - totalChartsWidth) / 2;
        
        if (chartImages.solicitudesStatus) {
            const chartX = chartsStartX;
            
            doc.setFontSize(10);
            doc.setTextColor(...primaryColor);
            doc.text('Estado de Solicitudes', chartX + chartWidth/2, chartsY - 5, { align: 'center' });
            
            doc.addImage(chartImages.solicitudesStatus, 'PNG', chartX, chartsY, chartWidth, chartHeight);
            
            console.log('Solicitudes status chart added to PDF successfully');
        } else {
            console.warn('Solicitudes status chart image not available');
        }
        
        if (chartImages.donacionesStatus) {
            const chartX = chartsStartX + chartWidth + chartSpacing;
            
            doc.setFontSize(10);
            doc.setTextColor(...primaryColor);
            doc.text('Estado de Donaciones', chartX + chartWidth/2, chartsY - 5, { align: 'center' });
            
            doc.addImage(chartImages.donacionesStatus, 'PNG', chartX, chartsY, chartWidth, chartHeight);
            
            console.log('Donaciones status chart added to PDF successfully');
        } else {
            console.warn('Donaciones status chart image not available');
        }
        
        addFooter(doc);
        console.log('Saving PDF...');
        doc.save('Reporte_Metricas.pdf');
        console.log('PDF saved successfully!');
        
        cleanupTemporaryCharts(tempCharts);
        
    } catch (error) {
        console.error('Error detallado al generar PDF:', error);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        
        if (typeof tempCharts !== 'undefined') {
            cleanupTemporaryCharts(tempCharts);
        }
        
        alert(`Hubo un error al generar el PDF: ${error.message || 'Error desconocido'}. Por favor, intente nuevamente.`);
    }
}; 
