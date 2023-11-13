import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { Fontisto } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";

import { API_KEY } from "@env";
const API_URL = "https://api.openweathermap.org/data/2.5";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ICONS = {
	Atmosphere: "cloudy-gusts",
	Clear: "day-sunny",
	Clouds: "cloudy",
	Drizzle: "rain",
	Rain: "rains",
	Snow: "snow",
	Thunderstorm: "lightning",
};

export default function App() {
	const [city, setCity] = useState("Loading...");
	const [days, setDays] = useState([]);
	const [ok, setOk] = useState(true);

	const getDate = (time) => {
		const date = new Date(time * 1000);
		return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
	};
	const getWeather = async () => {
		const { granted } = await Location.requestForegroundPermissionsAsync();
		if (!granted) {
			setOk(false);
			return;
		}
		if (ok) console.log("User granted on GeoLocationPermission.");

		const {
			coords: { latitude, longitude },
		} = await Location.getCurrentPositionAsync({ accuracy: 5 });
		const location = await Location.reverseGeocodeAsync(
			{ latitude, longitude },
			{ useGoogleMaps: false }
		);
		setCity(location[0].city);

		const response = await fetch(
			`${API_URL}/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`
		);
		const json = await response.json();
		setDays(json.daily);
	};

	useEffect(() => {
		getWeather();
	}, []);

	return (
		<View style={styles.container}>
			<StatusBar style="light" />
			<View style={styles.city}>
				<Text style={styles.cityName}>{city}</Text>
			</View>
			<ScrollView
				pagingEnabled
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.weather}
			>
				{days.length === 0 ? (
					<View style={{ ...styles.day, alignItems: "center" }}>
						<ActivityIndicator
							color="white"
							style={{ marginTop: 10 }}
							size="large"
						/>
					</View>
				) : (
					days.map((day, index) => (
						<View key={index} style={styles.day}>
							<View
								style={{
									justifyContent: "flex-start",
									alignItems: "center",
								}}
							>
								<Text style={styles.temp}>
									{parseFloat(day.temp.day).toFixed(1)}°
								</Text>
								<Text style={styles.specificDate}>
									{getDate(day.dt)}
								</Text>
							</View>
							<View
								style={{
									justifyContent: "flex-end",
									alignItems: "center",
								}}
							>
								<Fontisto
									name={ICONS[day.weather[0].main]}
									size={84}
									color="white"
								/>
								<Text style={styles.description}>
									{day.weather[0].main}
								</Text>
								<Text style={styles.tinyText}>
									{day.weather[0].description}
								</Text>
							</View>
						</View>
					))
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "tomato",
	},
	city: {
		flex: 1.5,
		justifyContent: "center",
		alignItems: "center",
	},
	cityName: {
		fontSize: 58,
		fontWeight: "500",
		color: "white",
	},
	weather: {},
	day: {
		width: SCREEN_WIDTH,
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "flex-start",
		paddingHorizontal: 5,
	},
	temp: {
		fontSize: 100,
		fontWeight: "600",
		color: "white",
	},
	description: {
		marginTop: 10,
		fontSize: 36,
		fontWeight: "500",
		color: "white",
	},
	tinyText: {
		fontSize: 24,
		fontWeight: "500",
		color: "white",
	},
	specificDate: {
		fontSize: 30,
		fontWeight: "600",
		color: "black",
	},
});
