import React, { useMemo, useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import Svg, { Polyline, Circle, G, Text as SvgText, Path, Line, Defs, ClipPath, Rect } from 'react-native-svg';
import { theme } from '@ui/shared/theme';
import { useTheme } from '@ui/shared/theme/ThemeContext';

interface Series {
    id: string;
    name: string;
    color: string;
    data: number[];
}

interface LineChartProps {
    labels: string[];
    series: Series[];
    height?: number;
    width?: number;
    allowZoom?: boolean;
    interactive?: boolean;
    onPointSelect?: (point: { index: number; values: Record<string, number> }) => void;
}

const formatValue = (val: number) => {
    if (val >= 1000000) {
        const value = (val / 1000000).toFixed(1).replace('.', ',');
        return `${value}M`;
    }
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
};

// Componente base del gráfico SVG
const ChartContent = ({
    labels,
    series,
    chartWidth,
    chartHeight,
    colors,
    selectedIndex,
    interactive,
    onPointSelect
}: {
    labels: string[];
    series: Series[];
    chartWidth: number;
    chartHeight: number;
    colors: any;
    selectedIndex: number | null;
    interactive: boolean;
    onPointSelect?: (point: { index: number; values: Record<string, number> }) => void;
}) => {
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 30;
    const paddingBottom = 45;

    const drawableWidth = chartWidth - paddingLeft - paddingRight;
    const drawableHeight = chartHeight - paddingTop - paddingBottom;

    const allValues = series.flatMap(s => s.data).map(v => Number(v) || 0);
    const validValues = allValues.filter(v => !isNaN(v));
    const rawMax = validValues.length > 0 ? Math.max(...validValues) : 1000;
    const rawMin = validValues.length > 0 ? Math.min(...validValues) : 0;

    const range = rawMax - rawMin;
    let minValue = 0;

    if (rawMin > 0 && range < rawMax * 0.7) {
        minValue = Math.floor((rawMin - (range * 0.2)) / 1000) * 1000;
        if (minValue < 0) minValue = 0;
    }

    const calculateNiceStep = (dataRange: number) => {
        const targetSteps = 4;
        const rawStep = dataRange / targetSteps;
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
        const normalized = rawStep / (magnitude || 1);

        let step;
        if (normalized < 1.5) step = 1 * magnitude;
        else if (normalized < 3) step = 2 * magnitude;
        else if (normalized < 7) step = 5 * magnitude;
        else step = 10 * magnitude;

        return step || 1000;
    };

    const step = calculateNiceStep(rawMax - minValue);
    const maxValue = Math.ceil(rawMax / step) * step;

    const renderLevels = [];
    for (let val = minValue; val <= maxValue; val += step) {
        renderLevels.push(val);
    }

    const scaleX = (index: number) => {
        const x = (index / (labels.length - 1 || 1)) * drawableWidth + paddingLeft;
        return isNaN(x) ? paddingLeft : x;
    };

    const scaleY = (value: number) => {
        const val = Number(value) || 0;
        const y = drawableHeight - ((val - minValue) / (maxValue - minValue)) * drawableHeight + paddingTop;
        return isNaN(y) ? paddingTop + drawableHeight : y;
    };

    const renderSeries = useMemo(() => {
        return series.map((s: Series) => {
            const points = s.data
                .map((val: number, idx: number) => `${scaleX(idx)},${scaleY(val)}`)
                .join(' ');

            return (
                <G key={s.id}>
                    <Polyline
                        points={points}
                        fill="none"
                        stroke={s.color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {s.data.map((val: number, idx: number) => {
                        const cx = scaleX(idx);
                        const cy = scaleY(val);
                        const isMax = val === Math.max(...s.data) && val > 0;

                        return (
                            <G key={`${s.id}-${idx}`}>
                                <Circle
                                    cx={cx}
                                    cy={cy}
                                    r="3"
                                    fill={colors.cardBackground}
                                    stroke={s.color}
                                    strokeWidth="1.5"
                                />
                                {isMax && (
                                    <SvgText
                                        x={cx}
                                        y={chartHeight - 18}
                                        fill={s.color}
                                        fontSize="10"
                                        fontWeight="bold"
                                        textAnchor="middle"
                                    >
                                        {formatValue(val)}
                                    </SvgText>
                                )}
                            </G>
                        );
                    })}
                </G>
            );
        });
    }, [series, labels, chartWidth, chartHeight, maxValue, minValue, colors]);

    const renderInteractiveElements = useMemo(() => {
        if (!interactive || selectedIndex === null) return null;

        const x = scaleX(selectedIndex);
        const elements = [];

        elements.push(
            <Line
                key="crosshair"
                x1={x}
                y1={paddingTop}
                x2={x}
                y2={chartHeight - paddingBottom}
                stroke={colors.textSecondary}
                strokeWidth="1"
                strokeDasharray="4,2"
            />
        );

        series.forEach((s, idx) => {
            const value = s.data[selectedIndex] || 0;
            const y = scaleY(value);

            elements.push(
                <Circle
                    key={`tooltip-circle-${s.id}`}
                    cx={x}
                    cy={y}
                    r="5"
                    fill={colors.cardBackground}
                    stroke={s.color}
                    strokeWidth="2"
                />
            );

            const labelY = y - 15 - (idx * 12);
            elements.push(
                <G key={`tooltip-label-${s.id}`}>
                    <SvgText
                        x={x}
                        y={labelY}
                        fill={s.color}
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                    >
                        {formatValue(value)}
                    </SvgText>
                    <Line
                        x1={x}
                        y1={labelY + 4}
                        x2={x}
                        y2={y - 5}
                        stroke={s.color}
                        strokeWidth="0.5"
                        strokeDasharray="2,2"
                    />
                </G>
            );
        });

        if (labels[selectedIndex]) {
            elements.push(
                <SvgText
                    key="x-label"
                    x={x}
                    y={chartHeight + 30}
                    fill={colors.primary}
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                >
                    {labels[selectedIndex]}
                </SvgText>
            );
        }

        return <G key="interactive">{elements}</G>;
    }, [interactive, selectedIndex, series, labels, chartWidth, chartHeight, colors]);

    return (
        <Svg height={chartHeight + 20} width={chartWidth}>
            <Defs>
                <ClipPath id="chartArea">
                    <Rect
                        x={paddingLeft}
                        y={paddingTop}
                        width={drawableWidth}
                        height={drawableHeight}
                    />
                </ClipPath>
            </Defs>

            {renderLevels.map((val) => {
                const y = scaleY(val);
                return (
                    <G key={`grid-${val}`}>
                        <Path
                            d={`M ${paddingLeft} ${y} L ${chartWidth - paddingRight} ${y}`}
                            stroke={colors.border}
                            strokeWidth="0.5"
                            strokeDasharray="4,4"
                        />
                        <SvgText
                            x={paddingLeft - 8}
                            y={y + 3}
                            fill={colors.textMuted}
                            fontSize="9"
                            textAnchor="end"
                        >
                            {formatValue(val)}
                        </SvgText>
                    </G>
                );
            })}

            <G clipPath="url(#chartArea)">
                {renderSeries}
            </G>

            {renderInteractiveElements}

            {labels.map((label: string, idx: number) => {
                if (!label) return null;
                const totalLabels = labels.length;
                const visibleLabelsCount = labels.filter(l => l).length;

                if (visibleLabelsCount > 10) {
                    const avgLabelLength = labels.reduce((acc, l) => acc + (l ? l.length : 0), 0) / (visibleLabelsCount || 1);
                    const labelWidth = avgLabelLength <= 2 ? 18 : 45;
                    const maxLabels = Math.floor(chartWidth / labelWidth);
                    const step = Math.ceil(totalLabels / maxLabels);
                    const lastIdx = totalLabels - 1;
                    const show = (idx === lastIdx) || ((lastIdx - idx) % step === 0);
                    if (!show) return null;
                }

                return (
                    <SvgText
                        key={`label-${idx}`}
                        x={scaleX(idx)}
                        y={chartHeight + 15}
                        fill={colors.textSecondary}
                        fontSize="11"
                        textAnchor="middle"
                    >
                        {label}
                    </SvgText>
                );
            })}
        </Svg>
    );
};

// Componente para móvil con gestos
const MobileChart = (props: LineChartProps & { chartWidth: number; chartHeight: number; colors: any }) => {
    const { labels, series, chartWidth, chartHeight, colors, interactive, onPointSelect } = props;
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    // Usar require dentro del componente para evitar errores en web
    let Gesture, GestureDetector, useSharedValue, useAnimatedStyle, withSpring, Animated;

    try {
        ({ Gesture, GestureDetector } = require('react-native-gesture-handler'));
        // Reanimated removed - use fallback functions
        useSharedValue = () => ({ value: 0 });
        useAnimatedStyle = (style: any) => style;
        withSpring = (val: number) => val;
        Animated = { View: require('react-native').View };
    } catch (error) {
        console.warn('Gesture libraries not available:', error);
        // Fall back to non-interactive chart
        return (
            <View style={[styles.container, { height: chartHeight + 40, width: chartWidth }]}>
                <ChartContent
                    labels={labels}
                    series={series}
                    chartWidth={chartWidth}
                    chartHeight={chartHeight}
                    colors={colors}
                    selectedIndex={selectedIndex}
                    interactive={false}
                    onPointSelect={onPointSelect}
                />
            </View>
        );
    }

    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedScale = useSharedValue(1);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    const pinchGesture = Gesture.Pinch()
        .onUpdate((event: any) => {
            const newScale = savedScale.value * event.scale;
            scale.value = Math.min(Math.max(newScale, 1), 4);
        })
        .onEnd(() => {
            savedScale.value = scale.value;
            if (scale.value <= 1.1) {
                scale.value = withSpring(1);
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                savedScale.value = 1;
                savedTranslateX.value = 0;
                savedTranslateY.value = 0;
            }
        });

    const panGesture = Gesture.Pan()
        .enabled(scale.value > 1)
        .onUpdate((event: any) => {
            if (scale.value > 1) {
                translateX.value = savedTranslateX.value + event.translationX;
                translateY.value = savedTranslateY.value + event.translationY;
            }
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const gesture = Gesture.Simultaneous(pinchGesture, panGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    const handleTouch = (event: any) => {
        if (!interactive) return;
        const { locationX } = event.nativeEvent;
        const paddingLeft = 45;
        const paddingRight = 20;
        const drawableWidth = chartWidth - paddingLeft - paddingRight;
        const relativeX = locationX - paddingLeft;
        if (relativeX < 0) return;
        if (relativeX > drawableWidth) return;
        const index = Math.round((relativeX / drawableWidth) * (labels.length - 1));
        const validIndex = Math.max(0, Math.min(index, labels.length - 1));
        setSelectedIndex(validIndex);
        if (onPointSelect) {
            const values: Record<string, number> = {};
            series.forEach((s: Series) => {
                values[s.id] = s.data[validIndex] || 0;
            });
            onPointSelect({ index: validIndex, values });
        }
    };

    return (
        <GestureDetector gesture={gesture}>
            <View
                style={[styles.container, { height: chartHeight + 40, width: chartWidth }]}
                onStartShouldSetResponder={interactive ? () => true : undefined}
                onMoveShouldSetResponder={interactive ? () => true : undefined}
                onResponderGrant={handleTouch}
                onResponderMove={handleTouch}
            >
                <Animated.View style={[styles.chartContainer, animatedStyle]}>
                    <ChartContent
                        labels={labels}
                        series={series}
                        chartWidth={chartWidth}
                        chartHeight={chartHeight}
                        colors={colors}
                        selectedIndex={selectedIndex}
                        interactive={!!interactive}
                        onPointSelect={onPointSelect}
                    />
                </Animated.View>
            </View>
        </GestureDetector>
    );
};

// Componente para web sin gestos
const WebChart = (props: LineChartProps & { chartWidth: number; chartHeight: number; colors: any }) => {
    const { labels, series, chartWidth, chartHeight, colors, interactive, onPointSelect } = props;
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const handleTouch = (event: any) => {
        if (!interactive) return;
        const { locationX } = event.nativeEvent;
        const paddingLeft = 45;
        const paddingRight = 20;
        const drawableWidth = chartWidth - paddingLeft - paddingRight;
        const relativeX = locationX - paddingLeft;
        if (relativeX < 0) return;
        if (relativeX > drawableWidth) return;
        const index = Math.round((relativeX / drawableWidth) * (labels.length - 1));
        const validIndex = Math.max(0, Math.min(index, labels.length - 1));
        setSelectedIndex(validIndex);
        if (onPointSelect) {
            const values: Record<string, number> = {};
            series.forEach((s: Series) => {
                values[s.id] = s.data[validIndex] || 0;
            });
            onPointSelect({ index: validIndex, values });
        }
    };

    return (
        <View
            style={[styles.container, { height: chartHeight + 40, width: chartWidth }]}
            onStartShouldSetResponder={interactive ? () => true : undefined}
            onMoveShouldSetResponder={interactive ? () => true : undefined}
            onResponderGrant={handleTouch}
            onResponderMove={handleTouch}
        >
            <ChartContent
                labels={labels}
                series={series}
                chartWidth={chartWidth}
                chartHeight={chartHeight}
                colors={colors}
                selectedIndex={selectedIndex}
                interactive={!!interactive}
                onPointSelect={onPointSelect}
            />
        </View>
    );
};

export const LineChart = ({
    labels,
    series,
    height = 200,
    width: propWidth,
    allowZoom = true,
    interactive = false,
    onPointSelect
}: LineChartProps) => {
    const { width: windowWidth } = useWindowDimensions();
    const { colors } = useTheme();

    const chartWidth = propWidth || (windowWidth !== undefined ? windowWidth - theme.spacing.md * 4 : 300);
    const chartHeight = height - 40;

    if (Platform.OS === 'web') {
        return (
            <WebChart
                labels={labels}
                series={series}
                height={height}
                width={propWidth}
                allowZoom={allowZoom ?? true}
                interactive={interactive ?? false}
                onPointSelect={onPointSelect}
                chartWidth={chartWidth}
                chartHeight={chartHeight}
                colors={colors}
            />
        );
    }

    return (
        <MobileChart
            labels={labels}
            series={series}
            height={height}
            width={propWidth}
            allowZoom={allowZoom ?? true}
            interactive={interactive ?? false}
            onPointSelect={onPointSelect}
            chartWidth={chartWidth}
            chartHeight={chartHeight}
            colors={colors}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
