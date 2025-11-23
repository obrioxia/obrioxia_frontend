@app.post("/submit")
async def submit(data: dict):
    vehicle_id = data.get("vehicleId")
    print("Received vehicle ID:", vehicle_id)
    return {"status": "ok", "vehicleId": vehicle_id}
