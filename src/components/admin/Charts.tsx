import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { admin } from '../../constants/theme';

export const CATEGORY_COLORS: Record<string, string> = {
  School: '#8b5a2b', Health: '#3aa57f', General: '#d9953f', Hobby: '#5b92c4',
};

const niceCeil = (n: number) => {
  const p = Math.pow(10, Math.floor(Math.log10(n)));
  const f = n / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
};
const fmt = (n: number) => (n >= 1000 ? `${n / 1000}k` : String(n));

const smooth = (p: { x: number; y: number }[]) => {
  if (!p.length) return '';
  let d = `M ${p[0].x} ${p[0].y}`;
  for (let i = 1; i < p.length; i++) {
    const mx = (p[i - 1].x + p[i].x) / 2;
    d += ` C ${mx} ${p[i - 1].y}, ${mx} ${p[i].y}, ${p[i].x} ${p[i].y}`;
  }
  return d;
};

export function AreaChart({ data, height = 240 }: { data: { label: string; value: number }[]; height?: number }) {
  const [w, setW] = useState(0);
  const padL = 40, padR = 12, padT = 12, padB = 26;
  const max = Math.max(4, ...data.map((d) => d.value));
  const step = niceCeil(max / 4);
  const top = step * 4;
  const innerW = Math.max(0, w - padL - padR);
  const innerH = height - padT - padB;
  const y = (v: number) => padT + innerH - (v / top) * innerH;
  const pts = data.map((d, i) => ({
    x: padL + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
    y: y(d.value),
  }));
  const line = smooth(pts);
  const area = pts.length ? `${line} L ${pts[pts.length - 1].x} ${padT + innerH} L ${pts[0].x} ${padT + innerH} Z` : '';
  const every = Math.ceil(data.length / 8);

  return (
    <View style={{ height }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <Svg width={w} height={height}>
          <Defs>
            <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={admin.gold} stopOpacity={0.35} />
              <Stop offset="1" stopColor={admin.gold} stopOpacity={0.02} />
            </LinearGradient>
          </Defs>
          {[0, 1, 2, 3, 4].map((i) => (
            <G key={i}>
              <Line x1={padL} x2={w - padR} y1={y(step * i)} y2={y(step * i)} stroke={admin.border} strokeWidth={1} />
              <SvgText x={padL - 8} y={y(step * i) + 4} fontSize={11} fill={admin.muted} textAnchor="end">{fmt(step * i)}</SvgText>
            </G>
          ))}
          <Path d={area} fill="url(#areaFill)" />
          <Path d={line} stroke={admin.gold} strokeWidth={2.5} fill="none" />
          {data.map((d, i) =>
            i % every === 0 ? (
              <SvgText key={i} x={pts[i].x} y={height - 6} fontSize={11} fill={admin.muted} textAnchor="middle">{d.label}</SvgText>
            ) : null
          )}
        </Svg>
      )}
    </View>
  );
}

export function Donut({ data, size = 190, thickness = 28, centerValue, centerLabel }: {
  data: { label: string; value: number; color: string }[];
  size?: number; thickness?: number; centerValue: string; centerLabel: string;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = data.reduce((a, d) => a + d.value, 0);
  let offset = 0;

  return (
    <View style={{ width: size, height: size, alignSelf: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={admin.grayBg} strokeWidth={thickness} fill="none" />
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          {total > 0 &&
            data.map((d) => {
              const len = (d.value / total) * c;
              const el = (
                <Circle
                  key={d.label}
                  cx={size / 2} cy={size / 2} r={r}
                  stroke={d.color} strokeWidth={thickness} fill="none"
                  strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset}
                />
              );
              offset += len;
              return el;
            })}
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: admin.text }}>{centerValue}</Text>
        <Text style={{ fontSize: 12, color: admin.muted }}>{centerLabel}</Text>
      </View>
    </View>
  );
}