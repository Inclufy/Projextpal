import { createDeepLink, openURL } from "../../utils/linking";
import * as Linking from "expo-linking";

describe("linking utility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createDeepLink", () => {
    it("creates a deep link with custom scheme", () => {
      const url = createDeepLink("projects/123");
      expect(url).toBe("projextpal://projects/123");
      expect(Linking.createURL).toHaveBeenCalledWith("projects/123", { queryParams: undefined });
    });

    it("appends query params when provided", () => {
      const url = createDeepLink("projects", { tab: "active", sort: "name" });
      expect(url).toBe("projextpal://projects?tab=active&sort=name");
    });

    it("handles empty path", () => {
      const url = createDeepLink("");
      expect(url).toBe("projextpal://");
    });
  });

  describe("openURL", () => {
    it("returns true when URL is supported and opened", async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValueOnce(true);
      (Linking.openURL as jest.Mock).mockResolvedValueOnce(undefined);
      const result = await openURL("https://projextpal.com");
      expect(result).toBe(true);
      expect(Linking.openURL).toHaveBeenCalledWith("https://projextpal.com");
    });

    it("returns false when URL is not supported", async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValueOnce(false);
      const result = await openURL("invalid://nope");
      expect(result).toBe(false);
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it("returns false and logs error when openURL throws", async () => {
      (Linking.canOpenURL as jest.Mock).mockRejectedValueOnce(new Error("network down"));
      const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const result = await openURL("https://projextpal.com");
      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });
});
